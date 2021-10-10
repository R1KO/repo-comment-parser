const aggregate = (data) => {
    const reviewers = new Map();

    data.forEach((link) => {
        link.data.forEach((reviewer) => {
            const reviewerId = reviewer.id.toString();

            let author = reviewers.get(reviewerId);
            if (!author) {
                reviewers.set(reviewerId, Object.assign({}, reviewer, {repos: 1}));
                return;
            }

            author.repos += 1;
            author.comments += reviewer.comments;
            author.reactionsPlus += reviewer.reactionsPlus;
            author.reactionsMinus += reviewer.reactionsMinus;
            reviewers.set(reviewerId, author);
        });
    });

    return [...reviewers.values()];
};

export default aggregate;
