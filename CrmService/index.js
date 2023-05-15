const { Kafka } = require('kafkajs');
const nodemailer = require('nodemailer');

const kafka = new Kafka({
  clientId: 'crm-service',
  brokers: ['44.214.218.139:9092', '44.214.213.141:9092'],
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'testcrmvarun@gmail.com',
    pass: 'pkqeoiswojoshoms',
  },
});

async function run() {
  const consumer = kafka.consumer({ groupId: 'crm-service-group' });

  await consumer.connect();
  await consumer.subscribe({ topic: 'varunaga.customer.evt', fromBeginning: true });

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const customer = JSON.parse(message.value.toString());
      const emailOptions = {
        from: '"Varun Agarwal" <testcrmvarun@gmail.com>',
        to: customer.userId,
        subject: 'Activate your book store account',
        text: `Dear ${customer.name},\n\nWelcome to the Book store created by varunaga.\nExceptionally this time we wont ask you to click a link to activate your account.`,
      };

      try {
        await transporter.sendMail(emailOptions);
        console.log(`Email sent to ${customer.userId}`);
      } catch (error) {
        console.error(`Error sending email to ${customer.userId}:`, error);
      }
    },
  });
}

run().catch(console.error);
