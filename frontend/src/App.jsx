import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import CreateBook from './pages/CreateBooks';
import ShowBook from './pages/ShowBook';
import EditBook from './pages/EditBook';
import DeleteBook from './pages/DeleteBook';
import Login from './components/Login';
import Register from './components/Register';

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" />;
    }
    return children;
};

const App = () => {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      
      <Route path='/' element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path='/books/create' element={
        <ProtectedRoute>
          <CreateBook />
        </ProtectedRoute>
      } />
      <Route path='/books/details/:id' element={
        <ProtectedRoute>
          <ShowBook />
        </ProtectedRoute>
      } />
      <Route path='/books/edit/:id' element={
        <ProtectedRoute>
          <EditBook />
        </ProtectedRoute>
      } />
      <Route path='/books/delete/:id' element={
        <ProtectedRoute>
          <DeleteBook />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default App;
