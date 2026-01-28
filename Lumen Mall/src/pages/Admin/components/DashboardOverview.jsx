import React from 'react';
import styles from './DashboardOverview.module.css';
import StatsGrid from './dashboard/StatsGrid';
import MonthlyRevenueChart from './dashboard/MonthlyRevenueChart';
import RecentOrders from './dashboard/RecentOrders';
import TopProducts from './dashboard/TopProducts';

const DashboardOverview = ({ inventory, orders, reviews, setActiveTab }) => {
  return (
    <>
      <h1>Dashboard Overview</h1>
      
      <StatsGrid
        inventory={inventory}
        orders={orders}
        reviews={reviews}
        setActiveTab={setActiveTab}
      />

      <MonthlyRevenueChart orders={orders} />

      <div className={styles.dashboardGrid}>
        <RecentOrders orders={orders} setActiveTab={setActiveTab} />
        <TopProducts orders={orders} inventory={inventory} />
      </div>
    </>
  );
};

export default DashboardOverview;
