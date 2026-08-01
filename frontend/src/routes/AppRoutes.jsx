import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import About from '../pages/About';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import AuthCallback from '../pages/AuthCallback';
import NotFound from '../pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile/:username" element={<Profile />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
