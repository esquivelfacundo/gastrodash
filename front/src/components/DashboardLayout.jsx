import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-container">
      <div className="main-content">
        <Sidebar />
        <div className="content-area">
          <div className="content-scroll">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
