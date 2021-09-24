import React from 'react';
import { Table, Space } from 'antd';

export default (props) => {

    const columns = [
        {
            title: 'Ревьюер',
            dataIndex: 'reviewer',
            key: 'reviewer',
            render: (reviewer) => <a href={reviewer.url}>{reviewer.name}</a>,
        },
        {
            title: 'Кол-во сессий',
            dataIndex: 'sessions',
            key: 'sessions',
        },
        {
            title: 'Кол-во коммитов',
            dataIndex: 'commits',
            key: 'commits',
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
        sessions: 2, // TODO
        commits: 2, // TODO
        comments: item.comments,
        repPlus: item.reactionsPlus,
        repMinus: item.reactionsMinus,
    }));

    /*
    [
            {
                key: '1',
                reviewer: {
                    url: 'url',
                    name: 'John Brown',
                },
                sessions: 32,
                commits: 32,
                comments: 32,
                repPlus: 32,
                repMinus: 32,
            },
            {
                key: '2',
                reviewer: {
                    url: 'url',
                    name: 'John Brown',
                },
                sessions: 32,
                commits: 32,
                comments: 32,
                repPlus: 32,
                repMinus: 32,
            },
            {
                key: '3',
                reviewer: {
                    url: 'url',
                    name: 'John Brown',
                },
                sessions: 32,
                commits: 32,
                comments: 32,
                repPlus: 32,
                repMinus: 32,
            },
        ];
    }
    */
    return (<Table columns={columns} dataSource={data} pagination={false}/>);
};
