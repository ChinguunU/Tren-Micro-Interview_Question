require('dotenv').config()
module.exports = {
    aws_table_name: 'Emailed_Customers',
    aws_remote_config: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: 'us-east-1',
    }
};