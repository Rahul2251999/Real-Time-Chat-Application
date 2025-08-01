import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { User, Mail, Image, Loader2 } from 'lucide-react';

const LoginForm = ({ onLogin, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    photo: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      try {
        await onLogin({
          name: formData.name,
          email: formData.email,
          photo: formData.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
        });
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Quick login options for demo purposes
  const quickLoginOptions = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      photo: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff'
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      photo: 'https://ui-avatars.com/api/?name=Jane+Smith&background=F56565&color=fff'
    },
    {
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      photo: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=38A169&color=fff'
    }
  ];

  const handleQuickLogin = async (userData) => {
    try {
      await onLogin(userData);
    } catch (error) {
      console.error('Quick login error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Login to Chat
          </CardTitle>
          <CardDescription>
            Enter your details to join the chat rooms with secure authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="photo">Photo URL (optional)</Label>
              <Input
                id="photo"
                type="url"
                placeholder="Enter photo URL"
                value={formData.photo}
                onChange={(e) => handleChange('photo', e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Join Chat
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or quick login
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {quickLoginOptions.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleQuickLogin(option)}
                disabled={isLoading}
              >
                <img
                  src={option.photo}
                  alt={option.name}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <div className="text-left">
                  <div className="font-medium">{option.name}</div>
                  <div className="text-xs text-muted-foreground">{option.email}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;

