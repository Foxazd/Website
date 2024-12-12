import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Comics from '../pages/Comics';
import About from '../pages/About';
import SearchResults from '../pages/SearchResults';
import Profile from '../pages/Profile';
import AdminPage from '../pages/AdminPage';
import ComicsList from '../pages/ComicsManagement/ComicsList';
import AddContent from '../pages/ComicsManagement/AddContent'
import CommentsManagement from '../pages/CommentsManagement';
import AddComic from '../components/AddComic';
import EditComic from '../components/EditComic';
import UsersList from '../pages/Admin/UsersList';
import UserEdit from '../pages/Admin/UserEdit';
import ProfileView from '../pages/Admin/ProfileView';
import DeleteUser from '../pages/Admin/DeleteUser';
import ComicsPage from '../pages/ComicsPage';
import FavoritesList from '../components/FavoritesList';
import Messages from '../components/Messages.js';
import ForgotPassword from '../components/ForgotPassword';
import ReadComic from '../pages/ReadComic';
import EditComment from '../components/EditComment';
import DeleteComment from '../components/DeleteComment';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Routes cơ bản */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/search" element={<SearchResults />} />

      {/* Routes người dùng */}
      <Route path="/profile/:username" element={<Profile />} />
      <Route path="/favorites/:username" element={<FavoritesList />} />
      <Route path="/messages/:username" element={<Messages />} />

      {/* Routes truyện */}
      <Route path="/comics" element={<Comics />} />
      <Route path="/comics/:id" element={<ComicsPage />} />
      <Route path="/read/:title/chapter/:chapterNumber" element={<ReadComic />} />

      {/* Routes quản trị viên */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/profile/:username" element={<ProfileView />} />

      {/* Quản lý truyện (admin) */}
      <Route path="/admin/comics" element={<ComicsList />} />
      <Route path="/admin/comics/add" element={<AddComic />} />
      <Route path="/admin/comics/edit/:id" element={<EditComic />} />
      <Route path="/admin/comics/:comicId/add-chapter" element={<AddContent />} />

      {/* Quản lý người dùng (admin) */}
      <Route path="/admin/users" element={<UsersList />} />
      <Route path="/admin/users/edit/:id" element={<UserEdit />} />
      <Route path="/admin/users/delete/:id" element={<DeleteUser />} />

      {/* Quản lý bình luận (admin) */}
      <Route path="/admin/comments" element={<CommentsManagement />} />
      <Route path="/admin/comments/edit/:id" element={<EditComment />} />
      <Route path="/admin/comments/delete/:id" element={<DeleteComment />} />
      
    </Routes>
  );
};

export default RoutesComponent;
