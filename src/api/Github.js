
class Github
{
    constructor(token) {
    }

    setToken(token) {
        this.token = token;
    }

    getParamsFromUrl(url) {
        const patterns = [
            /https:\/\/github\.com\/(?<owner>[\w-]+)\/(?<repo>[\w-]+)\/commit\/(?<commit>[\w-]+)/,
            /https:\/\/github\.com\/(?<owner>[\w-]+)\/(?<repo>[\w-]+)\/pull\/(?<pull>\d+)/,
        ];

        for (const pattern of patterns) {
            let params = url.match(pattern);
            console.log('match', params);
            if (params) {
                return params.groups;
            }
        }

        return null;
    }

    async request(url, options) {
        if (this.token) {
            options = options || {};
            if (!options.hasOwnProperty('headers')) {
                options.headers = {};
            }
            options.headers['Authorization'] = `token ${this.token}`;
        }
        let response = await fetch(url, options);
        return await response.json();
    }

    async getPaginatedList(getPage, perPage) {
        const list = [];

        console.log('getPaginatedList', perPage);
        let count = 0;

        let page = 1;
        while (true) {
            count++;
            if (count > 5) {
                return;
            }
            let pageList = await getPage(page, perPage);
            console.log('pageList.length', pageList.length);
            if (pageList.length) {
                list.push(...pageList);
            }

            if (pageList.length < perPage) {
                break;
            }
            ++page;
        }

        return list;
    };

    async getCommentsListByCommit(owner, repo, commit) {
        return await this.getPaginatedList(
            async (page, perPage) => this.getCommitComments(owner, repo, commit, page, perPage),
            100
        );
    };

    async getCommitComments(owner, repo, commit, page, perPage) {
        return await this.request(`https://api.github.com/repos/${owner}/${repo}/commits/${commit}/comments?per_page=${perPage}&page=${page}`);
    };

    async getCommentsListByPullRequest(owner, repo, request) {
        return await this.getPaginatedList(
            async (page, perPage) => await this.getPullRequestComments(owner, repo, request, page, perPage),
            100
        );
    };

    async getPullRequestComments(owner, repo, request, page, perPage) {
        return await this.request(`https://api.github.com/repos/${owner}/${repo}/pulls/${request}/comments?per_page=${perPage}&page=${page}`);
    };

    async getCommentReactionsList(owner, repo, comment) {
        return await this.getPaginatedList(
            async (page, perPage) => await this.getCommentReactions(owner, repo, comment, page, perPage),
            100
        );
    };

    async getCommentReactions(owner, repo, comment, page, perPage) {
        return await this.request(
            `https://api.github.com/repos/${owner}/${repo}/comments/${comment}/reactions?per_page=${perPage}&page=${page}`,
            {
                headers: {
                    'Accept': 'application/vnd.github.squirrel-girl-preview+json',
                },
            });
    };

    async getPullCommentReactions(owner, repo, comment, page, perPage) {
        return await this.request(
            `https://api.github.com/repos/${owner}/${repo}/pulls/comments/${comment}/reactions?per_page=${perPage}&page=${page}`,
            {
                headers: {
                    'Accept': 'application/vnd.github.squirrel-girl-preview+json',
                },
            });
    };

    async getPreparedData(comments, reactionsLoader) {
        console.log('getPreparedData', comments);

        if (!comments || !comments.length) {
            return null;
        }

        const reviewers = new Map();

        const reactionsPlus = ['+1', 'heart'];
        const reactionsMinus = ['-1'];

        for (const comment of comments) {
            const authorId = comment.user.id.toString();

            let author = reviewers.get(authorId);
            if (!author) {
                author = {
                    id: comment.user.id,
                    login: comment.user.login,
                    url: comment.user.html_url,
                    comments: 0,
                    reactionsPlus: 0,
                    reactionsMinus: 0,
                };
            }

            author.comments++;

            const reactions = await reactionsLoader(owner, repo, comment.id);
            const reactions = await this.getCommentReactions(owner, repo, comment.id);
            console.log('reactions', reactions);

            if (reactions && reactions.length) {
                for (const reaction of reactions) {
                    if (reactionsPlus.includes(reaction.content)) {
                        author.reactionsPlus++;
                    } else if (reactionsMinus.includes(reaction.content)) {
                        author.reactionsMinus++;
                    }
                }
            }

            reviewers.set(authorId, author);
        }

        return [...reviewers.values()];
    }


    async getDataByUrl(url) {
        console.log('getDataByUrl', url);
        const params = this.getParamsFromUrl(url);
        console.log('getParamsFromUrl', params);
        if (!params) {
            console.error('Invalid URL');
            return null;
        }

        if (params.commit) {
            const comments = await this.getCommentsListByCommit(params.owner, params.repo, params.commit);
            console.log('comments', comments);

            return await this.getPreparedData(params.owner, params.repo, comments);
        }

        if (params.pull) {
            const comments = await this.getCommentsListByPullRequest(params.owner, params.repo, params.pull);
            console.log('comments', comments);

            return await this.getPreparedData(params.owner, params.repo, comments);
        }

        return null;
    }
}

export default Github;
