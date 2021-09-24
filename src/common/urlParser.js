import Github from '../api/Github';

const getHandlerByUrl = (url) => {
    return new Github();
};

export {getHandlerByUrl};
