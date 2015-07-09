CREATE DATABASE mainstream;
# You should replace "password" below with a real password
GRANT SELECT, INSERT, UPDATE, DELETE ON mainstream.* TO mainstream@localhost IDENTIFIED BY 'password';

FLUSH PRIVILEGES;

CREATE TABLE `posts` (`id` CHAR(10) NOT NULL, `content` TEXT, `image` TINYTEXT, `author` TINYTEXT, `category` TINYTEXT, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `upvotes` (`id` CHAR(10) NOT NULL, `author` VARCHAR(100), FOREIGN KEY (id) REFERENCES posts(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8;
