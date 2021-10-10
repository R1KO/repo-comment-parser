import React from 'react';
import { Table, Space } from 'antd';

export default (props) => {

    const columns = [
        {
            title: 'Ревьюер',
            dataIndex: 'reviewer',
            key: 'reviewer',
            render: (reviewer) => <a href={reviewer.url} target="_blank" rel="noreferrer noopener">{reviewer.name}</a>,
        },

        {
            title: 'Кол-во репозиториев',
            key: 'repos',
            dataIndex: 'repos',
        },
        {
            title: 'Кол-во комментариев',
            key: 'comments',
            dataIndex: 'comments',
        },
        {
            title: 'Лайки',
            key: 'repPlus',
            dataIndex: 'repPlus',
        },
        {
            title: 'Дизлайки',
            key: 'repMinus',
            dataIndex: 'repMinus',
        },
    ];

    const data = props.data.map((item, index) => ({
        key: index.toString(),
        reviewer: {
            url: item.url,
            name: item.login,
        },
        repos: item.repos,
        comments: item.comments,
        repPlus: item.reactionsPlus,
        repMinus: item.reactionsMinus,
    }));

    return (<Table columns={columns} dataSource={data} pagination={false}/>);
};
