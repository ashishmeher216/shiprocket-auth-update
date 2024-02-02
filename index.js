const AWS = require('aws-sdk');

exports.handler = async (event, context) => {
    try {
        const reqBody = {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD
        };

        const options = {
            method: 'POST',
            body: JSON.stringify(reqBody),
            headers: { 'Content-Type': 'application/json' }
        }

        const url = process.env.SHIPROCKET_AUTH_LINK;
        const response = await fetch(url, options)
        const jsonResponse = await response.json();
        const token = jsonResponse.token;

        // Update Elastic Beanstalk environment variable
        const MY_AWS_CONFIG = {
            accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
            region: process.env.MY_AWS_REGION,
        }
        const elasticBeanstalk = new AWS.ElasticBeanstalk(MY_AWS_CONFIG);
        const params = {
            EnvironmentName: process.env.MY_AWS_BENSTALK_ENVIRONMENT_NAME,
            OptionSettings: [
                {
                    Namespace: 'aws:elasticbeanstalk:application:environment',
                    OptionName: 'SHIPROCKET_TOKEN',
                    Value: token
                },
            ],
        };

        await elasticBeanstalk.updateEnvironment(params).promise();

        return { statusCode: 200, body: 'Success' };
    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
