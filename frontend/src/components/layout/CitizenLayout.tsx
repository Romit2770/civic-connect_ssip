import React from 'react';
import { Outlet } from 'react-router-dom';
import GovernmentUtilityBar from '../common/GovernmentUtilityBar';
import GovernmentHeader from '../common/GovernmentHeader';
import GovernmentFooter from '../common/GovernmentFooter';

export default function CitizenLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <GovernmentUtilityBar />
      <GovernmentHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <GovernmentFooter />
    </div>
  );
}
