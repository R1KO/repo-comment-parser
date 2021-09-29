import './App.css';
import {Row, Col, Form, Input, Button, Space, Card} from 'antd';
import {getHandlerByUrl} from './common/urlParser';
import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons';
import React, {Fragment, useState} from 'react';
import Report from './Report';

const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: {span: 24, offset: 0},
        sm: {span: 20, offset: 4},
    },
};

function App() {
    const [reportsData, setReportsData] = useState([]);

    const reports = [];

    const onFinish = (values) => {
        console.log('Success:', values);

        values.links.forEach(async (link) => {
            if (!link.length) {
                return;
            }
            const handler = getHandlerByUrl(link);
            /*if (values.github_token.length) {
                handler.setToken(values.github_token);
            }*/
            let data = await handler.getDataByUrl(link);
            console.log('data:', data);
            if (!data) {
                data = [];
            }
            reports.push({link, data});
            setReportsData([...reports]);
        });
    };
    console.log('reportsData', reportsData);

    const onFinishFailed = (errorInfo) => {
        console.error('Failed:', errorInfo);
    };

    return (
        <div className="App" style={{marginTop: 100}}>
            <Row>
                <Col span={12} offset={6}>
                    <Form
                        name="basic"
                        layout="vertical"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        initialValues={{
                            links: [''],
                            // for test
                            // links: [
                            //     'https://github.com/saintbyte/carrier-analyzer/pull/7',
                            //     'https://github.com/mbogomazov/angular-tictactoe-pwa/commit/428fb3da1f9f0684d65d154bca417a7f5832b648',
                            // ],
                            github_token: process.env.GTIHUB_TOKEN || '',
                        }}
                        {...formItemLayoutWithOutLabel}
                    >


                       {/* <Space direction="vertical" style={{width: '100%'}}>
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
                                <Input style={{width: '70%'}} />
                            </Form.Item>
                        </Space>*/}

                        <Form.List
                            name="links"
                            rules={[
                                {
                                    validator: async (_, links) => {
                                        if (!links || !links.length) {
                                            return Promise.reject(new Error('At least 2 passengers'));
                                        }
                                    },
                                },
                            ]}
                        >
                            {(fields, { add, remove }, { errors }) => (
                                <Fragment>
                                    {fields.map((field, index) => (
                                        <Form.Item
                                            {...formItemLayoutWithOutLabel}
                                            required={false}
                                            key={field.key}
                                        >
                                            <Form.Item
                                                {...field}
                                                validateTrigger={['onChange', 'onBlur']}
                                                rules={[
                                                    {
                                                        required: true,
                                                        whitespace: true,
                                                        message: "Please input link or delete this field.",
                                                    },
                                                ]}
                                                noStyle
                                            >
                                                <Input placeholder="Url to commit/PR" style={{ width: '90%' }} />
                                            </Form.Item>
                                            {fields.length > 1 ? (
                                                <MinusCircleOutlined
                                                    className="dynamic-delete-button"
                                                    onClick={() => remove(field.name)}
                                                />
                                            ) : null}
                                        </Form.Item>
                                    ))}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            style={{ width: '60%' }}
                                            icon={<PlusOutlined />}
                                        >
                                            Add field
                                        </Button>
                                        <Form.ErrorList errors={errors} />
                                    </Form.Item>
                                </Fragment>
                            )}
                        </Form.List>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    {reportsData.length !== 0 && reportsData.map((reportData) => {
                        return (<Card key={reportData.link} title={<a href={reportData.link}>{reportData.link}</a>} style={{ width: '100%' }}>
                            <Report data={reportData.data}/>
                        </Card>);
                    })}
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <div id="powered_by">
                        <a href="https://github.com/R1KO/repo-comment-parser">
                            <img width="16" height="16" src="https://raw.githubusercontent.com/rdimascio/icons/master/icons/dark/github.svg" />
                        </a> Powered by <a href="https://github.com/R1KO/repo-comment-parser">Github.com</a>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default App;
