import { useState, useEffect } from 'react';
import { Bell, Lock, Globe, Palette, Database, Mail, Users, Shield, CheckCircle, Download } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { toast } from 'sonner';
import { adminAPI } from '../../../lib/api';

export function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    // Platform Settings
    platformName: 'Medsphere Learning',
    timezone: 'Australia/Sydney',
    defaultLanguage: 'en-AU',
    maintenanceMode: false,

    // Notifications
    systemAlerts: true,
    userActivityNotifications: true,
    coursePublishAlerts: true,
    adminDigest: true,

    // Email Settings
    emailProvider: 'smtp',
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    fromEmail: 'noreply@medsphere.com',

    // Security
    enforceStrongPasswords: true,
    require2FA: false,
    sessionTimeout: '60',
    maxLoginAttempts: '5',

    // Branding
    primaryColor: '#3B82F6',
    logoUrl: '',
    favicon: '',

    // Data & Storage
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '365',

    // User Management
    allowSelfRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: 'learner',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await adminAPI.getSettings();
      if (Object.keys(data).length > 0) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSaveSettings = async () => {
    try {
      await adminAPI.updateSettings(settings);
      toast.success('All settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleResetSettings = () => {
    fetchSettings();
    toast.info('Settings reset to last saved state');
  };


  const handleExportConfig = () => {
    toast.success('Configuration exported successfully!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Settings</h1>
          <p className="text-gray-600">Configure system preferences and platform settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportConfig}>
            <Download size={16} className="mr-2" />
            Export Config
          </Button>
          <Button variant="outline" onClick={handleResetSettings}>
            Reset Defaults
          </Button>
          <Button onClick={handleSaveSettings}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Content */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="data">Data & Storage</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Globe className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">General Platform Settings</h3>
                <p className="text-sm text-gray-600">Configure basic platform preferences</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="platformName" className="text-base font-medium">Platform Name</Label>
                <Input
                  id="platformName"
                  value={settings.platformName}
                  onChange={(e) => handleSettingChange('platformName', e.target.value)}
                  placeholder="Enter platform name"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-base font-medium">Default Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => handleSettingChange('timezone', value)}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
                    <SelectItem value="Australia/Melbourne">Melbourne (AEST)</SelectItem>
                    <SelectItem value="Australia/Brisbane">Brisbane (AEST)</SelectItem>
                    <SelectItem value="Australia/Perth">Perth (AWST)</SelectItem>
                    <SelectItem value="Australia/Adelaide">Adelaide (ACST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="defaultLanguage" className="text-base font-medium">Default Language</Label>
                <Select
                  value={settings.defaultLanguage}
                  onValueChange={(value) => handleSettingChange('defaultLanguage', value)}
                >
                  <SelectTrigger id="defaultLanguage">
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

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="maintenanceMode" className="text-base font-medium">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600 mt-1">Temporarily disable platform access for maintenance</p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="allowSelfRegistration" className="text-base font-medium">Allow Self Registration</Label>
                  <p className="text-sm text-gray-600 mt-1">Allow users to create accounts without admin approval</p>
                </div>
                <Switch
                  id="allowSelfRegistration"
                  checked={settings.allowSelfRegistration}
                  onCheckedChange={(checked) => handleSettingChange('allowSelfRegistration', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="requireEmailVerification" className="text-base font-medium">Require Email Verification</Label>
                  <p className="text-sm text-gray-600 mt-1">Users must verify their email address</p>
                </div>
                <Switch
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Bell className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Admin Notification Settings</h3>
                <p className="text-sm text-gray-600">Configure admin alerts and notifications</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="systemAlerts" className="text-base font-medium">System Alerts</Label>
                  <p className="text-sm text-gray-600 mt-1">Receive notifications about system errors and issues</p>
                </div>
                <Switch
                  id="systemAlerts"
                  checked={settings.systemAlerts}
                  onCheckedChange={(checked) => handleSettingChange('systemAlerts', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="userActivityNotifications" className="text-base font-medium">User Activity Notifications</Label>
                  <p className="text-sm text-gray-600 mt-1">Get notified about new user registrations and activity</p>
                </div>
                <Switch
                  id="userActivityNotifications"
                  checked={settings.userActivityNotifications}
                  onCheckedChange={(checked) => handleSettingChange('userActivityNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="coursePublishAlerts" className="text-base font-medium">Course Publish Alerts</Label>
                  <p className="text-sm text-gray-600 mt-1">Notifications when new courses are published</p>
                </div>
                <Switch
                  id="coursePublishAlerts"
                  checked={settings.coursePublishAlerts}
                  onCheckedChange={(checked) => handleSettingChange('coursePublishAlerts', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="adminDigest" className="text-base font-medium">Daily Admin Digest</Label>
                  <p className="text-sm text-gray-600 mt-1">Receive a daily summary of platform activity</p>
                </div>
                <Switch
                  id="adminDigest"
                  checked={settings.adminDigest}
                  onCheckedChange={(checked) => handleSettingChange('adminDigest', checked)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Mail className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Email Configuration</h3>
                <p className="text-sm text-gray-600">Configure SMTP and email settings</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="emailProvider" className="text-base font-medium">Email Provider</Label>
                <Select
                  value={settings.emailProvider}
                  onValueChange={(value) => handleSettingChange('emailProvider', value)}
                >
                  <SelectTrigger id="emailProvider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smtp">SMTP</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                    <SelectItem value="ses">Amazon SES</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost" className="text-base font-medium">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort" className="text-base font-medium">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={settings.smtpPort}
                    onChange={(e) => handleSettingChange('smtpPort', e.target.value)}
                    placeholder="587"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="fromEmail" className="text-base font-medium">From Email Address</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={settings.fromEmail}
                  onChange={(e) => handleSettingChange('fromEmail', e.target.value)}
                  placeholder="noreply@example.com"
                />
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Button onClick={() => toast.info('Sending test email...')}>
                  <Mail size={16} className="mr-2" />
                  Send Test Email
                </Button>
                <Button variant="outline" onClick={() => toast.info('Viewing email templates')}>
                  View Email Templates
                </Button>
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
                <p className="text-sm text-gray-600">Configure authentication and security policies</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="enforceStrongPasswords" className="text-base font-medium">Enforce Strong Passwords</Label>
                  <p className="text-sm text-gray-600 mt-1">Require minimum 8 characters with mixed case and symbols</p>
                </div>
                <Switch
                  id="enforceStrongPasswords"
                  checked={settings.enforceStrongPasswords}
                  onCheckedChange={(checked) => handleSettingChange('enforceStrongPasswords', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="require2FA" className="text-base font-medium">Require Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600 mt-1">Force all users to enable 2FA for their accounts</p>
                </div>
                <Switch
                  id="require2FA"
                  checked={settings.require2FA}
                  onCheckedChange={(checked) => handleSettingChange('require2FA', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout" className="text-base font-medium">Session Timeout (minutes)</Label>
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
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts" className="text-base font-medium">Max Login Attempts</Label>
                <Select
                  value={settings.maxLoginAttempts}
                  onValueChange={(value) => handleSettingChange('maxLoginAttempts', value)}
                >
                  <SelectTrigger id="maxLoginAttempts">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 attempts</SelectItem>
                    <SelectItem value="5">5 attempts</SelectItem>
                    <SelectItem value="10">10 attempts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Palette className="text-pink-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Branding & Theme</h3>
                <p className="text-sm text-gray-600">Customize platform appearance and branding</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="text-base font-medium">Primary Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                    className="w-20 h-12"
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="text-base font-medium">Platform Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={settings.logoUrl}
                  onChange={(e) => handleSettingChange('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="favicon" className="text-base font-medium">Favicon URL</Label>
                <Input
                  id="favicon"
                  value={settings.favicon}
                  onChange={(e) => handleSettingChange('favicon', e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                />
              </div>

              <Separator />

              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-blue-600" size={20} />
                  <h4 className="font-semibold text-gray-900">Preview</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Changes to branding will be reflected across the entire platform after saving
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Data & Storage Settings */}
        <TabsContent value="data">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Database className="text-indigo-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Data & Storage</h3>
                <p className="text-sm text-gray-600">Manage backups, archiving, and data retention</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="autoBackup" className="text-base font-medium">Automatic Backups</Label>
                  <p className="text-sm text-gray-600 mt-1">Enable automatic database backups</p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="backupFrequency" className="text-base font-medium">Backup Frequency</Label>
                <Select
                  value={settings.backupFrequency}
                  onValueChange={(value) => handleSettingChange('backupFrequency', value)}
                >
                  <SelectTrigger id="backupFrequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="dataRetention" className="text-base font-medium">Data Retention (days)</Label>
                <Select
                  value={settings.dataRetention}
                  onValueChange={(value) => handleSettingChange('dataRetention', value)}
                >
                  <SelectTrigger id="dataRetention">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="730">2 years</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Button onClick={() => toast.info('Creating backup...')}>
                  <Download size={16} className="mr-2" />
                  Create Backup Now
                </Button>
                <Button variant="outline" onClick={() => toast.info('Viewing backup history')}>
                  View Backup History
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
