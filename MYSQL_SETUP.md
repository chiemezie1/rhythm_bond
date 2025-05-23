# MySQL Setup Guide for RhythmBond

This guide will help you set up MySQL for the RhythmBond application.

## Prerequisites

- Administrative access to your system
- Internet connection for downloading MySQL

## Installation

### Windows

1. **Download MySQL Installer**
   - Visit [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
   - Download the MySQL Installer for Windows

2. **Run the Installer**
   - Execute the downloaded installer
   - Choose "Developer Default" setup type
   - Follow the installation wizard

3. **Configure MySQL Server**
   - Set a strong root password
   - Create a user account for the application (recommended)
   - Configure MySQL to start automatically

### macOS

1. **Using Homebrew (Recommended)**
   ```bash
   # Install Homebrew if not already installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install MySQL
   brew install mysql
   
   # Start MySQL service
   brew services start mysql
   ```

2. **Using MySQL Installer**
   - Download MySQL from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
   - Install the .dmg package
   - Follow the installation wizard

### Linux (Ubuntu/Debian)

```bash
# Update package index
sudo apt update

# Install MySQL Server
sudo apt install mysql-server

# Start MySQL service
sudo systemctl start mysql

# Enable MySQL to start on boot
sudo systemctl enable mysql

# Secure MySQL installation
sudo mysql_secure_installation
```

### Linux (CentOS/RHEL/Fedora)

```bash
# Install MySQL Server
sudo dnf install mysql-server  # For Fedora
# OR
sudo yum install mysql-server  # For CentOS/RHEL

# Start MySQL service
sudo systemctl start mysqld

# Enable MySQL to start on boot
sudo systemctl enable mysqld

# Get temporary root password
sudo grep 'temporary password' /var/log/mysqld.log

# Secure MySQL installation
sudo mysql_secure_installation
```

## Database Setup

### 1. Connect to MySQL

```bash
# Connect as root
mysql -u root -p
```

### 2. Create Database and User

```sql
-- Create the database
CREATE DATABASE rhythm_bond CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a user for the application
CREATE USER 'rhythmbond_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON rhythm_bond.* TO 'rhythmbond_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 3. Test Connection

```bash
# Test the new user connection
mysql -u rhythmbond_user -p rhythm_bond
```

## Environment Configuration

Create or update your `.env.local` file with the database connection string:

```env
# Database Configuration
DATABASE_URL="mysql://rhythmbond_user:your_secure_password@localhost:3306/rhythm_bond"

# Other environment variables
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Prisma Setup

After setting up MySQL, configure Prisma:

```bash
# Generate Prisma client
npx prisma generate

# Push the schema to the database
npx prisma db push

# Seed the database with initial data
npx prisma db seed
```

## Verification

### 1. Check Database Connection

```bash
# Test Prisma connection
npx prisma studio
```

This will open Prisma Studio in your browser where you can view and manage your database.

### 2. Verify Tables

Connect to MySQL and check if tables were created:

```sql
USE rhythm_bond;
SHOW TABLES;
```

You should see tables like:
- User
- Account
- Session
- Track
- Playlist
- PlaylistTrack
- And others...

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check if MySQL is running
   sudo systemctl status mysql  # Linux
   brew services list | grep mysql  # macOS
   ```

2. **Access Denied**
   - Verify username and password
   - Check user privileges
   - Ensure the user can connect from localhost

3. **Database Not Found**
   ```sql
   -- Recreate the database
   CREATE DATABASE rhythm_bond CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Port Issues**
   - Default MySQL port is 3306
   - Check if port is available: `netstat -an | grep 3306`
   - Update DATABASE_URL if using a different port

### Reset MySQL Root Password

If you forget the root password:

**Linux/macOS:**
```bash
# Stop MySQL
sudo systemctl stop mysql

# Start MySQL in safe mode
sudo mysqld_safe --skip-grant-tables &

# Connect without password
mysql -u root

# Reset password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
EXIT;

# Restart MySQL normally
sudo systemctl start mysql
```

## Performance Optimization

### Basic MySQL Configuration

Add these settings to your MySQL configuration file (`my.cnf` or `my.ini`):

```ini
[mysqld]
# Basic settings
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M

# Character set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Query cache (for MySQL 5.7 and earlier)
query_cache_type = 1
query_cache_size = 64M
```

### Regular Maintenance

```sql
-- Optimize tables periodically
OPTIMIZE TABLE User, Track, Playlist, PlaylistTrack;

-- Check table status
CHECK TABLE User, Track, Playlist;
```

## Backup and Restore

### Create Backup

```bash
# Full database backup
mysqldump -u rhythmbond_user -p rhythm_bond > rhythm_bond_backup.sql

# Backup with compression
mysqldump -u rhythmbond_user -p rhythm_bond | gzip > rhythm_bond_backup.sql.gz
```

### Restore Backup

```bash
# Restore from backup
mysql -u rhythmbond_user -p rhythm_bond < rhythm_bond_backup.sql

# Restore from compressed backup
gunzip < rhythm_bond_backup.sql.gz | mysql -u rhythmbond_user -p rhythm_bond
```

## Security Best Practices

1. **Use Strong Passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, and symbols

2. **Limit User Privileges**
   - Only grant necessary permissions
   - Use specific database users for applications

3. **Network Security**
   - Bind MySQL to localhost if not using remote connections
   - Use SSL for remote connections

4. **Regular Updates**
   - Keep MySQL updated to the latest stable version
   - Monitor security advisories

## Support

If you encounter issues with MySQL setup:

1. Check the [MySQL Documentation](https://dev.mysql.com/doc/)
2. Review MySQL error logs
3. Consult the [RhythmBond Issues](https://github.com/yourusername/rhythm-bond/issues) page
4. Contact the development team

## Next Steps

After completing the MySQL setup:

1. Return to the main [README.md](README.md) for application setup
2. Follow the installation instructions
3. Start the development server
4. Begin using RhythmBond!
