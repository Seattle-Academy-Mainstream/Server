CREATE DATABASE IF NOT EXISTS mainstream;
# You should replace "password" below with a real password
GRANT SELECT, INSERT, UPDATE, DELETE, DROP ON mainstream.* TO mainstream@localhost IDENTIFIED BY 'password';

FLUSH PRIVILEGES;

USE mainstream;
CREATE TABLE `posts` (`ID` CHAR(10) NOT NULL, `Content` TEXT, `Image` TINYTEXT, `Author` TINYTEXT, `Category` TINYTEXT, `Timestamp` TINYTEXT, PRIMARY KEY (`ID`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `upvotes` (`ID` CHAR(10) NOT NULL, `Author` VARCHAR(100), FOREIGN KEY (ID) REFERENCES posts(ID) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8;