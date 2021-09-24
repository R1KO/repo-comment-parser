import './App.css';
import {Row, Col, Form, Input, Button, Space, Card} from 'antd';
import {getHandlerByUrl} from './common/urlParser';
import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons';
import {useState} from 'react';
// import OAuth2Login from 'react-oauth2-login';


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


const DynamicFieldSet = () => {
    const onFinish = values => {
        console.log('Received values of form:', values);
    };

    return (
        <Form name="dynamic_form_item" {...formItemLayoutWithOutLabel} onFinish={onFinish}>
            <Form.List
                name="names"
                rules={[
                    {
                        validator: async (_, names) => {
                            if (!names || names.length < 2) {
                                return Promise.reject(new Error('At least 2 passengers'));
                            }
                        },
                    },
                ]}
            >
                {(fields, {add, remove}, {errors}) => (
                    <>
                        {fields.map((field, index) => (
                            <Form.Item
                                {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                                label={index === 0 ? 'Passengers' : ''}
                                required={false}
                                key={field.key}
                            >
                                <Form.Item
                                    {...field}
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[
                                        {
                                            required:   true,
                                            whitespace: true,
                                            message:    "Please input passenger's name or delete this field.",
                                        },
                                    ]}
                                    noStyle
                                >
                                    <Input placeholder="passenger name" style={{width: '60%'}} />
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
                                style={{width: '60%'}}
                                icon={<PlusOutlined />}
                            >
                                Add field
                            </Button>
                            <Button
                                type="dashed"
                                onClick={() => {
                                    add('The head item', 0);
                                }}
                                style={{width: '60%', marginTop: '20px'}}
                                icon={<PlusOutlined />}
                            >
                                Add field at head
                            </Button>
                            <Form.ErrorList errors={errors} />
                        </Form.Item>
                    </>
                )}
            </Form.List>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};

function App() {
    const onFinish = async (values) => {
        console.log('Success:', values);
        const handler = getHandlerByUrl(values.link);
        const data = await handler.getDataByUrl(values.link);
        console.log('data:', data);
    };

    const onFinishFailed = (errorInfo) => {
        console.error('Failed:', errorInfo);
    };

    const [sessions, setSessions] = useState([
        {links: [''],},
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

    // const onSuccess = response => console.log(response);
    // const onFailure = response => console.error(response);
    //
    // console.log('GTIHUB_APP_CLIENT_ID', process.env.GTIHUB_APP_CLIENT_ID);
    // console.log('GTIHUB_APP_CLIENT_SECRET', process.env.GTIHUB_APP_CLIENT_SECRET);

    return (
        <div className="App" style={{marginTop: 100}}>
            <OAuth2Login
                clientId={process.env.GTIHUB_APP_CLIENT_ID}
                authorizeUri={process.env.GTIHUB_APP_CLIENT_SECRET}
                onSuccess={onSuccess}
                onFailure={onFailure}
            />
            <Row>
                <Col span={12} offset={6}>
                    {/*<DynamicFieldSet/>*/}
                    <Form
                        name="basic"
                        layout="vertical"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        initialValues={{links: ['']}}
                        {...formItemLayoutWithOutLabel}
                    >
                        {sessions.map((session, index) => {
                            return <Space key={index} direction="vertical" style={{width: '100%'}}>
                                <Card title={`Session ${index + 1}`}
                                      extra={<a onClick={() => delSession(index)} href="#">Delete</a>}>
                                    {session.links.map((link, linkIndex) => {
                                        return <Form.Item key={linkIndex}>
                                            <Input placeholder="Link" />
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
        </div>
    );
}

export default App;
/*

                    <Form
                        name="basic"
                        layout="vertical"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        initialValues={{links: ['']}}
                        {...formItemLayoutWithOutLabel}
                    >
                        <Form.List name="links">
                            {(fields, {add, remove}, { errors }) => (
                                <>
                                {fields.map((field, index) => (
                                    <Form.Item
                                        {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                                        label={index === 0 ? 'Passengers' : ''}
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
                                                    message: "Please input passenger's name or delete this field.",
                                                },
                                            ]}
                                            noStyle
                                        >
                                            <Input placeholder="passenger name" style={{ width: '60%' }} />
                                        </Form.Item>
                                        {fields.length > 1 ? (
                                            <MinusCircleOutlined
                                                styles={{marginLeft: 10}}
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
                                    <Button
                                        type="dashed"
                                        onClick={() => {
                                            add('The head item', 0);
                                        }}
                                        style={{ width: '60%', marginTop: '20px' }}
                                        icon={<PlusOutlined />}
                                    >
                                        Add field at head
                                    </Button>
                                    <Form.ErrorList errors={errors} />
                                </Form.Item>
                                </>
                            )}
                                 {/*   {fields.map(({key, name, index, fieldKey, ...restField}) => (
                                        <div key={key} style={{display: 'flex'}}>
                                            <Form.Item
                                                name="link"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:  'Please input your link!',
                                                    },
                                                ]} >
                                                <Input placeholder="Commit/Pull request Link" />
                                                <MinusCircleOutlined onClick={() => remove(name)} />
                                            </Form.Item>
                                        </div>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Add Link
                                        </Button>
                                    </Form.Item>
                                </>
</Form.List>

{/*<Form.Item
                            label="Gtihub token"
                            name="github_token"
                            rules={[
                                {
                                    required: false,
                                    message:  'Please input your token!',
                                },
                            ]}
                        >
                            <Input />
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
 */