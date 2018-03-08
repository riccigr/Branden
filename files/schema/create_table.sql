use branden;

CREATE TABLE payments(
    id INT(11) AUTO_INCREMENT NOT NULL PRIMARY KEY,
    method VARCHAR(50) DEFAULT NULL,
    value DECIMAL(12,2) DEFAULT NULL,
    currency VARCHAR(3) DEFAULT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT NULL,
    create_date DATETIME,
    update_date DATETIME
);
