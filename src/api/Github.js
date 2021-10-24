
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
        if (!response.ok) {
            throw new Error(response);
        }

        return await response.json();
    }

    async getPaginatedList(getPage, perPage) {
        const list = [];

        console.log('getPaginatedList', perPage);

        let page = 1;
        while (true) {
            try {
                let pageList = await getPage(page, perPage);
                if (!pageList) {
                    break;
                }

                if (pageList.length) {
                    list.push(...pageList);
                }

                if (pageList.length < perPage) {
                    break;
                }
                ++page;
            } catch (e) {
                console.log('error', e);
            }
        }

        return list;
    };

    async getCommentsListByCommit(owner, repo, commit) {
        return await this.getPaginatedList(
            async (page, perPage) => await this.getCommitComments(owner, repo, commit, page, perPage),
            100
        );
    };

    async getCommitComments(owner, repo, commit, page, perPage) {
        return await this.request(`https://api.github.com/repos/${owner}/${repo}/commits/${commit}/comments?per_page=${perPage}&page=${page}`,
            {
                headers: {
                    'Accept': 'application/vnd.github.squirrel-girl-preview+json',
                },
            });
    };

    async getCommentsListByPullRequest(owner, repo, request) {
        return await this.getPaginatedList(
            async (page, perPage) => await this.getPullRequestComments(owner, repo, request, page, perPage),
            100
        );
    };

    async getPullRequestComments(owner, repo, request, page, perPage) {
        return await this.request(`https://api.github.com/repos/${owner}/${repo}/pulls/${request}/comments?per_page=${perPage}&page=${page}`,
            {
                headers: {
                    'Accept': 'application/vnd.github.squirrel-girl-preview+json',
                },
            });
    };

    async getPullRequestIssueComments(owner, repo, request, page, perPage) {
        return await this.request(`https://api.github.com/repos/${owner}/${repo}/issues/${request}/comments?per_page=${perPage}&page=${page}`,
            {
                headers: {
                    'Accept': 'application/vnd.github.squirrel-girl-preview+json',
                },
            });
    };

    async getCommentReactionsList(owner, repo, comment) {
        return await this.getPaginatedList(
            async (page, perPage) => await this.getCommentReactions(owner, repo, comment, page, perPage),
            100
        );
    };

    async getPreparedData(comments) {
        console.log('getPreparedData', comments);

        if (!comments || !comments.length) {
            return null;
        }

        const reviewers = new Map();

        const reactionsPlus = ['+1'/*, 'heart'*/];
        const reactionsMinus = ['-1'];

        for (const comment of comments) {
            if (comment.user.type === 'Bot') {
                continue;
            }

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

            for (const reaction of reactionsPlus) {
                if (comment.reactions.hasOwnProperty(reaction) && comment.reactions[reaction]) {
                    author.reactionsPlus += comment.reactions[reaction];
                }
            }
            for (const reaction of reactionsMinus) {
                if (comment.reactions.hasOwnProperty(reaction) && comment.reactions[reaction]) {
                    author.reactionsMinus += comment.reactions[reaction];
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

            return await this.getPreparedData(comments);
        }

        if (params.pull) {
            const comments = await this.getCommentsListByPullRequest(params.owner, params.repo, params.pull);
            const requestComents = await this.getPullRequestIssueComments(params.owner, params.repo, params.pull);
            console.log('comments', comments);
            console.log('requestComents', requestComents);
            if (requestComents && requestComents.length) {
                comments.push(...requestComents);
            }

            return await this.getPreparedData(comments);
        }

        return null;
    }
}

export default Github;
