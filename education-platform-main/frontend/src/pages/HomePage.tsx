import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/feed', { replace: true });
  }, [navigate]);

  return null;
};

export default HomePage;
