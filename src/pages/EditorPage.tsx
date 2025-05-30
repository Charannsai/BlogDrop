import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Editor from '../components/editor/Editor';
import { useAuthStore } from '../store/authStore';

const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!id) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <Editor blogId={id} />
    </div>
  );
};

export default EditorPage;