const { MongoClient } = require('mongodb');
require('dotenv').config();
const mongoURL = process.env.MONGODB_URL;
const dbName = 'test';
const mongoClient = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

const getDeviceDataByDatetime = async (req, res) => {
    const { espTopic, datetime } = req.params;
    try {
        await mongoClient.connect();
        const db = mongoClient.db(dbName);
        const deviceCollection = db.collection(espTopic);
        const data = await deviceCollection.find({ dateTime: datetime }).toArray();
        if (data.length > 0) {
            res.json(data);
        } else {
            res.status(404).json({ error: 'No data found for the specified datetime' });
        }
    } catch (err) {
        console.error('Failed to fetch data:', err.message);
        res.status(500).json({ error: 'Failed to fetch data.' });
    }
};

const getDeviceDataByDateRange = async (req, res) => {
  const { espTopic } = req.params;
  const { startDate, endDate, parameter } = req.query;
  try {
      await mongoClient.connect();
      const db = mongoClient.db(dbName);
      const deviceCollection = db.collection(espTopic);

      const start = dayjs(startDate);
      const end = dayjs(endDate);
      const result = [];

      let current = start;

      while (current <= end) {
          // Create the minute's start and end times
          const minuteStart = current.format('YYYY-MM-DD HH:mm:00');
          const minuteEnd = current.format('YYYY-MM-DD HH:mm:59');

          // Find the first document within this minute
          const entry = await deviceCollection.findOne({
              dateTime: { $gte: minuteStart, $lte: minuteEnd }
          });

          if (entry && entry.parameters && entry.parameters.hasOwnProperty(parameter)) {
              result.push({
                  dateTime: entry.dateTime,
                  [parameter]: entry.parameters[parameter]
              });
          }

          // Move to the next minute
          current = current.add(1, 'minute');
      }

      if (result.length > 0) {
          res.json(result);
      } else {
          res.status(404).json({ error: 'No data found for the specified date range' });
      }
  } catch (err) {
      console.error('Failed to fetch data:', err.message);
      res.status(500).json({ error: 'Failed to fetch data.' });
  }
};

const downloadDeviceData = async (req, res) => {
    const { espTopic } = req.params;
  const { startDate, endDate } = req.query;
  try {
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const deviceCollection = db.collection(espTopic);
    const data = await deviceCollection.find({
      dateTime: {
        $gte: startDate,
        $lte: endDate
      }
    }).toArray();
    if (data.length > 0) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'No data found for the specified date range' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};

const getDeviceParameters = async (req, res) => {
    const { espTopic } = req.params;
    try {
      await mongoClient.connect();
      const db = mongoClient.db(dbName);
      const deviceCollection = db.collection(espTopic);
      const data = await deviceCollection.findOne();
      if (data) {
        let parameters = {};
        if (data.parameters && typeof data.parameters === 'object') {
          parameters = data.parameters;
        } else {
          parameters = Object.fromEntries(
            Object.entries(data).filter(([key]) => !['_id', 'id', 'dateTime', 'dataType'].includes(key))
          );
        }
        res.json(Object.keys(parameters));
      } else {
        res.status(404).json({ error: 'No data found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch parameters' });
    }
};

module.exports = {
    getDeviceDataByDatetime, getDeviceDataByDateRange, downloadDeviceData, getDeviceParameters
};