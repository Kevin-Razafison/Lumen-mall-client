import React from 'react';
import styles from './DashboardOverview.module.css';
import StatsGrid from './dashboard/StatsGrid';
import MonthlyRevenueChart from './dashboard/MonthlyRevenueChart';
import RecentOrders from './dashboard/RecentOrders';
import TopProducts from './dashboard/TopProducts';

const DashboardOverview = () => {
  
  return (
    <div className={styles.overviewWrapper}>
      <h1 className={styles.title}>Dashboard Overview</h1>
      
      <StatsGrid />

      <MonthlyRevenueChart />

      <div className={styles.dashboardGrid}>
        <RecentOrders />
        <TopProducts />
      </div>
    </div>
  );
};

export default DashboardOverview;