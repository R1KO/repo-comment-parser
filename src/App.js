import './App.css';
import {Row, Col, Form, Input, Button, Space, Card} from 'antd';
import {getHandlerByUrl} from './common/urlParser';
import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons';
import React, {useState} from 'react';
import Report from './Report';

const formItemLayout = {
    labelCol:   {
        xs: {span: 24},
        sm: {span: 4},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 20},
    },
};
const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: {span: 24, offset: 0},
        sm: {span: 20, offset: 4},
    },
};

function App() {
    const [reportData, setReportData] = useState(null);

    const onFinish = async (values) => {
        console.log('Success:', values);

        console.log('sessions:', sessions);
        sessions.map(async (session) => {
            console.log('session:', session);
            session.links.map(async (link) => {
                console.log('link:', link);
                const handler = getHandlerByUrl(link);
                if (values.github_token.length) {
                    handler.setToken(values.github_token);
                }
                const data = await handler.getDataByUrl(link);
                console.log('data:', data);
                setReportData(data);
            });
        });
    };

    const onFinishFailed = (errorInfo) => {
        console.error('Failed:', errorInfo);
    };

    const [sessions, setSessions] = useState([
        {
            links: [
                'https://github.com/TimurBaldin/BumblebeeGeneratorService/pull/14'
                // 'https://github.com/andreaskosten/php_examples/commit/19c5500941ec544128962b29ffe6da9eb0ad07d1',
                // 'https://github.com/mbogomazov/angular-tictactoe-pwa/commit/428fb3da1f9f0684d65d154bca417a7f5832b648',
            ],
        },
    ]);

    const addSession = () => {
        setSessions([...sessions, {links: [''],}]);
    }

    const delSession = (delIndex) => {
        setSessions([...sessions.filter((session, index) => index !== delIndex)]);
    }

    const addLink = (sessionIndex) => {
        setSessions([...sessions.map((session, index) => {
            if (index !== sessionIndex) {
                return session;
            }

            return {...session, links: [...session.links, '']};
        })]);
    }

    const delLink = (sessionIndex, linkIndex) => {
        setSessions([...sessions.map((session, index) => {
            if (index !== sessionIndex) {
                return session;
            }

            return {...session, links: [...session.links.filter((session, index) => index !== linkIndex)]};
        })]);
    }

    return (
        <div className="App" style={{marginTop: 100}}>
            <Row>
                <Col span={12} offset={6}>
                    {/*<DynamicFieldSet/>*/}
                    <Form
                        name="basic"
                        layout="vertical"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        initialValues={{
                            // links: [''],
                            github_token: process.env.GTIHUB_TOKEN || '',
                        }}
                        {...formItemLayoutWithOutLabel}
                    >
                        <Space direction="vertical" style={{width: '100%'}}>
                            <Form.Item
                                label="Gtihub token"
                                name="github_token"
                                rules={[
                                    {
                                        required: false,
                                        message: 'Please input your token!',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Space>

                        {sessions.map((session, index) => {
                            return <Space key={index} direction="vertical" style={{width: '100%'}}>
                                <Card title={`Session ${index + 1}`}
                                      extra={<a onClick={() => delSession(index)} href="#">Delete</a>}>
                                    {session.links.map((link, linkIndex) => {
                                        return <Form.Item key={linkIndex}>
                                            <Input placeholder="Link" value={link}/>
                                        </Form.Item>
                                    })}

                                    <Form.Item style={{marginTop: 20}}>
                                        <Button
                                            type="dashed"
                                            onClick={() => addLink(index)}
                                            style={{width: '60%'}}
                                            icon={<PlusOutlined />}
                                        >
                                            Add link
                                        </Button>
                                    </Form.Item>
                                </Card>
                            </Space>
                        })}
                        <Form.Item style={{marginTop: 20}}>
                            <Button
                                type="dashed"
                                onClick={() => addSession()}
                                style={{width: '60%'}}
                                icon={<PlusOutlined />}
                            >
                                Add session
                            </Button>
                        </Form.Item>
                        <Form.Item
                            wrapperCol={{
                                offset: 8,
                                span:   16,
                            }}
                        >
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
            {reportData && <Report data={reportData}/>}
        </div>
    );
}

export default App;
