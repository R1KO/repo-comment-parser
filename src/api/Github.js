


class Github
{
    constructor() {

    }

    setToken(token) {
        this.token = token;
    }

    getParamsFromUrl(url) {
        const patterns = [
            /https:\/\/github\.com\/(?<owner>[\w-]+)\/(?<repo>[\w-]+)\/commit\/(?<commit>[\w-]+)/,
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
            options.headers['Authorization'] = `token ${this.token}`;
        }
        let response = await fetch(url, options);
        return await response.json();
    }

    async getPaginatedList(getPage, perPage) {
        const list = [];

        let page = 1;
        while (true) {
            let pageList = getPage(page, perPage);
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
            (page, perPage) => this.getCommitComments(owner, repo, commit, page, perPage),
            100
        );
    };

    async getCommitComments(owner, repo, commit, page, perPage) {
        return await this.request(`https://api.github.com/repos/${owner}/${repo}/commits/${commit}/comments?per_page=${perPage}&page=${page}`);
    };

    async getCommentReactionsList(owner, repo, comment) {
        return await this.getPaginatedList(
            (page, perPage) => this.getCommentReactions(owner, repo, comment, page, perPage),
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

    async getPreparedData(owner, repo, comments) {
        console.log('getPreparedData', comments);

        if (!comments || !comments.length) {
            return null;
        }
        // Кол-во сессий -
        // Кол-во коммитов -
        // Кол-во комментариев
        // Лайки
        // Дизлайки
        // Отмечен админом -

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
        const params = this.getParamsFromUrl(url);
        console.log('getParamsFromUrl', params);
        if (!params) {
            console.error('Invalid URL');
            return null;
        }

        if (params.commit) {
            const comments = await this.getCommitComments(params.owner, params.repo, params.commit);
            console.log('comments', comments);

            return await this.getPreparedData(params.owner, params.repo, comments);
        }

        return null;
    }
}

export default Github;
