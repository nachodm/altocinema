CREATE TABLE USERS (
    email VARCHAR (255) NOT NULL PRIMARY KEY, -- primary key column
    pass VARCHAR (255) NOT NULL,
    name VARCHAR(255) DEFAULT NULL
    -- specify more columns here
);

CREATE TABLE FILMS (
    email INT NOT NULL PRIMARY KEY, -- primary key column
    pass [NVARCHAR](50) NOT NULL,
    -- specify more columns here
);
 
 CREATE TABLE FESTIVALS (
    email INT NOT NULL PRIMARY KEY, -- primary key column
    pass [NVARCHAR](50) NOT NULL,
    -- specify more columns here
);

CREATE TABLE FILMCATEGORIES (
    film_id INT NOT NULL,
    category [NVARCHAR](50) NOT NULL,
    primary key(festival_id, category)
    -- specify more columns here
);

CREATE TABLE FESTIVALCATEGORIES (
    festival_id INT NOT NULL,
    category [NVARCHAR](50) NOT NULL,
    primary key(festival_id, category)
);