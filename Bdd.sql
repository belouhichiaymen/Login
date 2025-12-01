CREATE DATABASE IF NOT EXISTS test;
USE test;

CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);

INSERT INTO utilisateurs (nom, prenom, password) VALUES 
‎('بن عمر', 'محمد', '123456'),
‎('الفلاني', 'فاطمة', 'azerty'),
‎('العلاني', 'خالد', 'password123');
