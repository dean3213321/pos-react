import AddCategoryButton from './components/AddCategoryButton.jsx';

const Admin = () => {
  const handleCategoryAdded = (newCategory) => {
    console.log('New category added:', newCategory);
    // You could refresh your categories list here if needed
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <AddCategoryButton onCategoryAdded={handleCategoryAdded} />
      
      {/* Rest of your admin dashboard content */}
    </div>
  );
}

export default Admin;