import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineAddBox, MdOutlineDelete } from 'react-icons/md';
import BooksTable from '../components/home/BooksTable';
import BooksCard from '../components/home/BooksCard';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showType, setShowType] = useState('table');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log("Logged in user data:", parsedUser);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch all profile books
    axios
              .get('/api/profilebooks', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((response) => {
        console.log("Books data from backend:", response.data.data);
        setBooks(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className='p-4'>
      <div className='flex justify-between items-center mb-4'>
        <div className='flex items-center gap-x-4'>
          <button
            className='bg-sky-300 hover:bg-sky-600 px-4 py-1 rounded-lg'
            onClick={() => setShowType('table')}
          >
            Table
          </button>
          <button
            className='bg-sky-300 hover:bg-sky-600 px-4 py-1 rounded-lg'
            onClick={() => setShowType('card')}
          >
            Card
          </button>
        </div>
        <div className='flex items-center gap-x-4'>
          {user && (
            <span className='text-gray-700'>Welcome, {user.username}</span>
          )}
          <button
            onClick={handleLogout}
            className='bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg'
          >
            Logout
          </button>
        </div>
      </div>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl my-8'>All Books</h1>
        <Link to='/books/create'>
          <MdOutlineAddBox className='text-sky-800 text-4xl' />
        </Link>
      </div>
      {loading ? (
        <Spinner />
      ) : showType === 'table' ? (
        <BooksTable books={books} />
      ) : (
        <BooksCard books={books} />
      )}
    </div>
  );
};

export default Home; 
