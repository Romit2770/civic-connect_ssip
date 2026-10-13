const mongoose = require('mongoose');
const uri = 'mongodb+srv://romitkakadiya2703_db_user:romit_2703@civicconnect-cluster.mzlfuu6.mongodb.net/civicconnect?appName=civicconnect-cluster';

async function main() {
  await mongoose.connect(uri);
  const users = await mongoose.connection.collection('users').find({
    role: { $in: ['field_officer', 'field_worker', 'citizen', 'municipal_admin'] }
  }).project({ name: 1, email: 1, role: 1, badgeNumber: 1 }).toArray();
  console.log('Found users:', users);

  const complaintsCount = await mongoose.connection.collection('complaints').countDocuments();
  console.log('Total complaints in DB:', complaintsCount);
  const complaints = await mongoose.connection.collection('complaints').find().limit(5).project({ complaintNumber: 1, title: 1, status: 1, assignedOfficerId: 1 }).toArray();
  console.log('Sample complaints:', complaints);

  await mongoose.disconnect();
}
main().catch(console.error);
