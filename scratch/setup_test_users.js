const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://romitkakadiya2703_db_user:romit_2703@civicconnect-cluster.mzlfuu6.mongodb.net/civicconnect?appName=civicconnect-cluster';

async function setupUsers() {
  await mongoose.connect(uri);
  const usersColl = mongoose.connection.collection('users');
  const deptsColl = mongoose.connection.collection('departments');
  const wardsColl = mongoose.connection.collection('wards');

  const pwdDept = await deptsColl.findOne({ slug: 'public_works' });
  const swmDept = await deptsColl.findOne({ slug: 'sanitation' });
  const ward1 = await wardsColl.findOne({ wardNumber: 1 });
  const ward4 = await wardsColl.findOne({ wardNumber: 4 });

  const hashedOfficerPassword = await bcrypt.hash('Officer@123', 10);
  const hashedCitizenPassword = await bcrypt.hash('Citizen@123', 10);
  const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);

  // 1. Citizen A: Rahul Patel
  let citizenA = await usersColl.findOne({ email: 'citizen.rahul@example.com' });
  if (!citizenA) {
    await usersColl.insertOne({
      name: 'Rahul Patel',
      email: 'citizen.rahul@example.com',
      password: hashedCitizenPassword,
      phone: '+91 9825012345',
      role: 'citizen',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Created Citizen A: Rahul Patel');
  } else {
    await usersColl.updateOne(
      { _id: citizenA._id },
      { $set: { name: 'Rahul Patel', password: hashedCitizenPassword, isActive: true } }
    );
    console.log('Updated Citizen A: Rahul Patel');
  }

  // 2. Citizen B: Sneha Dave
  let citizenB = await usersColl.findOne({ email: 'citizen.sneha@example.com' });
  if (!citizenB) {
    await usersColl.insertOne({
      name: 'Sneha Dave',
      email: 'citizen.sneha@example.com',
      password: hashedCitizenPassword,
      phone: '+91 9825012346',
      role: 'citizen',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Created Citizen B: Sneha Dave');
  } else {
    await usersColl.updateOne(
      { _id: citizenB._id },
      { $set: { name: 'Sneha Dave', password: hashedCitizenPassword, isActive: true } }
    );
    console.log('Updated Citizen B: Sneha Dave');
  }

  // 3. Municipal Admin: Chief Control Room Admin
  let municipalAdmin = await usersColl.findOne({ email: 'admin@civicconnect.gov.in' });
  if (!municipalAdmin) {
    await usersColl.insertOne({
      name: 'Municipal Admin (Control Desk)',
      email: 'admin@civicconnect.gov.in',
      password: hashedAdminPassword,
      phone: '+91 9876543211',
      role: 'municipal_admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Created Municipal Admin');
  } else {
    await usersColl.updateOne(
      { _id: municipalAdmin._id },
      { $set: { role: 'municipal_admin', password: hashedAdminPassword, isActive: true } }
    );
    console.log('Updated Municipal Admin');
  }

  // 4. Field Worker A: Ramesh Patel
  let workerA = await usersColl.findOne({ email: 'officer.ramesh@civicconnect.gov.in' });
  if (!workerA) {
    await usersColl.insertOne({
      name: 'Ramesh Patel',
      email: 'officer.ramesh@civicconnect.gov.in',
      password: hashedOfficerPassword,
      phone: '+91 9876543224',
      role: 'field_officer',
      designation: 'PWD Senior Field Inspector',
      badgeNumber: 'PWD-FW-101',
      departmentId: pwdDept ? pwdDept._id : null,
      wardId: ward4 ? ward4._id : null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Created Field Worker A: Ramesh Patel');
  } else {
    await usersColl.updateOne(
      { _id: workerA._id },
      {
        $set: {
          name: 'Ramesh Patel',
          password: hashedOfficerPassword,
          role: 'field_officer',
          designation: 'PWD Senior Field Inspector',
          badgeNumber: 'PWD-FW-101',
          departmentId: pwdDept ? pwdDept._id : workerA.departmentId,
          isActive: true,
        },
      }
    );
    console.log('Updated Field Worker A: Ramesh Patel');
  }

  // 5. Field Worker B: Suresh Patel
  let workerB = await usersColl.findOne({ email: 'officer.suresh@civicconnect.gov.in' });
  if (!workerB) {
    await usersColl.insertOne({
      name: 'Suresh Patel',
      email: 'officer.suresh@civicconnect.gov.in',
      password: hashedOfficerPassword,
      phone: '+91 9876543225',
      role: 'field_officer',
      designation: 'Sanitation & Solid Waste Supervisor',
      badgeNumber: 'SWM-FW-102',
      departmentId: swmDept ? swmDept._id : null,
      wardId: ward1 ? ward1._id : null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Created Field Worker B: Suresh Patel');
  } else {
    await usersColl.updateOne(
      { _id: workerB._id },
      {
        $set: {
          name: 'Suresh Patel',
          password: hashedOfficerPassword,
          role: 'field_officer',
          designation: 'Sanitation & Solid Waste Supervisor',
          badgeNumber: 'SWM-FW-102',
          departmentId: swmDept ? swmDept._id : workerB.departmentId,
          isActive: true,
        },
      }
    );
    console.log('Updated Field Worker B: Suresh Patel');
  }

  console.log('User setup completed successfully!');
  await mongoose.disconnect();
}

setupUsers().catch(console.error);
