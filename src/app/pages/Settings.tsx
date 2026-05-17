import { useEffect, useState } from 'react';
import { Bell, Lock, Globe, Moon, Eye, Shield, Smartphone, Mail, Download, Trash2, HelpCircle, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { authAPI } from '../../lib/api';

export function Settings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    courseReminders: true,
    messageNotifications: true,
    weeklyDigest: false,
    
    // Privacy
    profileVisibility: 'public',
    showProgress: true,
    showCertificates: true,
    
    // Appearance
    theme: 'light',
    language: 'en-AU',
    fontSize: 'medium',
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: '30',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const user = await authAPI.getCurrentUser();
      if (user.settings && Object.keys(user.settings).length > 0) {
        setSettings(prev => ({ ...prev, ...user.settings }));
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSaveSettings = async () => {
    try {
      await authAPI.updateProfile({ settings });
      toast.success('All settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleResetSettings = () => {
    fetchUserSettings();
    toast.info('Settings reset to last saved state');
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.current) {
      toast.error('Please enter your current password');
      return;
    }
    if (!passwordData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      await authAPI.changePassword({
        current_password: passwordData.current,
        new_password: passwordData.newPassword
      });
      setPasswordData({ current: '', newPassword: '', confirm: '' });
      toast.success('Password updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    }
  };


  const handleDeleteAccount = () => {
    if (deleteConfirmText === 'DELETE') {
      localStorage.removeItem('mockUser');
      toast.success('Account deleted. Redirecting to home...');
      setShowDeleteConfirm(false);
      setTimeout(() => {
        window.location.href = '/';
        window.location.hash = '';
      }, 1500);
    } else {
      toast.error('Please type DELETE to confirm account deletion');
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSaveSettings}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Content */}
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                <p className="text-sm text-gray-600">Manage how you receive updates and alerts</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="emailNotifications" className="text-base font-medium">Email Notifications</Label>
                  <p className="text-sm text-gray-600 mt-1">Receive updates and alerts via email</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="pushNotifications" className="text-base font-medium">Push Notifications</Label>
                  <p className="text-sm text-gray-600 mt-1">Get real-time notifications on your device</p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="courseReminders" className="text-base font-medium">Course Reminders</Label>
                  <p className="text-sm text-gray-600 mt-1">Receive reminders about upcoming lessons and deadlines</p>
                </div>
                <Switch
                  id="courseReminders"
                  checked={settings.courseReminders}
                  onCheckedChange={(checked) => handleSettingChange('courseReminders', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="messageNotifications" className="text-base font-medium">Message Notifications</Label>
                  <p className="text-sm text-gray-600 mt-1">Get notified when you receive new messages</p>
                </div>
                <Switch
                  id="messageNotifications"
                  checked={settings.messageNotifications}
                  onCheckedChange={(checked) => handleSettingChange('messageNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="weeklyDigest" className="text-base font-medium">Weekly Digest</Label>
                  <p className="text-sm text-gray-600 mt-1">Receive a weekly summary of your learning progress</p>
                </div>
                <Switch
                  id="weeklyDigest"
                  checked={settings.weeklyDigest}
                  onCheckedChange={(checked) => handleSettingChange('weeklyDigest', checked)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Eye className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
                <p className="text-sm text-gray-600">Control who can see your information</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="profileVisibility" className="text-base font-medium">Profile Visibility</Label>
                <p className="text-sm text-gray-600 mb-2">Choose who can view your profile</p>
                <Select
                  value={settings.profileVisibility}
                  onValueChange={(value) => handleSettingChange('profileVisibility', value)}
                >
                  <SelectTrigger id="profileVisibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Everyone</SelectItem>
                    <SelectItem value="organization">Organization Only</SelectItem>
                    <SelectItem value="private">Private - Only Me</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="showProgress" className="text-base font-medium">Show Learning Progress</Label>
                  <p className="text-sm text-gray-600 mt-1">Allow others to see your course completion progress</p>
                </div>
                <Switch
                  id="showProgress"
                  checked={settings.showProgress}
                  onCheckedChange={(checked) => handleSettingChange('showProgress', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="showCertificates" className="text-base font-medium">Show Certificates</Label>
                  <p className="text-sm text-gray-600 mt-1">Display your earned certificates on your profile</p>
                </div>
                <Switch
                  id="showCertificates"
                  checked={settings.showCertificates}
                  onCheckedChange={(checked) => handleSettingChange('showCertificates', checked)}
                />
              </div>

              <Separator />

              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <HelpCircle className="text-blue-600 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">About Privacy</h4>
                    <p className="text-sm text-gray-600">
                      Your privacy is important to us. We only share information as per your preferences and in compliance with privacy regulations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Moon className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Appearance Settings</h3>
                <p className="text-sm text-gray-600">Customize how the platform looks for you</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme" className="text-base font-medium">Theme</Label>
                <p className="text-sm text-gray-600 mb-2">Choose your preferred color scheme</p>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => handleSettingChange('theme', value)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="language" className="text-base font-medium">Language</Label>
                <p className="text-sm text-gray-600 mb-2">Select your preferred language</p>
                <Select
                  value={settings.language}
                  onValueChange={(value) => handleSettingChange('language', value)}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-AU">English (Australia)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="fontSize" className="text-base font-medium">Font Size</Label>
                <p className="text-sm text-gray-600 mb-2">Adjust text size for better readability</p>
                <Select
                  value={settings.fontSize}
                  onValueChange={(value) => handleSettingChange('fontSize', value)}
                >
                  <SelectTrigger id="fontSize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Shield className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                <p className="text-sm text-gray-600">Manage your account security</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="currentPassword" className="text-base font-medium">Change Password</Label>
                <p className="text-sm text-gray-600 mb-3">Update your password regularly for better security</p>
                <div className="space-y-3">
                  <Input type="password" placeholder="Current password" value={passwordData.current} onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })} />
                  <Input type="password" placeholder="New password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                  <Input type="password" placeholder="Confirm new password" value={passwordData.confirm} onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })} />
                  <Button variant="outline" onClick={handleUpdatePassword}>Update Password</Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="twoFactorAuth" className="text-base font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout" className="text-base font-medium">Session Timeout</Label>
                <p className="text-sm text-gray-600 mb-2">Automatically log out after inactivity</p>
                <Select
                  value={settings.sessionTimeout}
                  onValueChange={(value) => handleSettingChange('sessionTimeout', value)}
                >
                  <SelectTrigger id="sessionTimeout">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="p-4 bg-amber-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="text-amber-600 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Security Recommendation</h4>
                    <p className="text-sm text-gray-600">
                      We recommend enabling two-factor authentication for enhanced account security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account">
          <div className="space-y-6">
            {/* Connected Devices */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Smartphone className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Connected Devices</h3>
                  <p className="text-sm text-gray-600">Manage devices that have access to your account</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Current Device</p>
                      <p className="text-sm text-gray-600">Chrome on Windows • Sydney, NSW</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                    <CheckCircle size={14} className="mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Data Management */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Download className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
                  <p className="text-sm text-gray-600">Download or delete your account data</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => toast.success('Preparing your data for download...')}>
                  <Download size={20} className="mr-2" />
                  Download My Data
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => toast.success('Data export request submitted! You\'ll receive an email shortly.')}>
                  <Mail size={20} className="mr-2" />
                  Request Data Export
                </Button>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Danger Zone</h3>
                  <p className="text-sm text-gray-600">Irreversible actions for your account</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-white rounded-xl border-2 border-red-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Delete Account</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Input
                    type="text"
                    placeholder="Type DELETE to confirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                    className="w-full mb-2"
                  />
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                    onClick={handleDeleteAccount}
                  >
                    Delete My Account
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}