INSERT INTO department(department_name)
VALUES ("Engineering"), ("Sales"), ("Finance"), ("Legal"), ("Marketing");

INSERT INTO role(title, salary, department_id)
VALUES("Engineer", 85000, 1), ("Senior Engineer", 125000, 1), ("CFO", 350000, 3), ("Full Stack Developer", 80000, 1), ("Accountant", 10000, 3), ("Project Manager", 100000, 1), ("Lawyer", 64000, 4), ("Marketing Manager", 160000, 5);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES("Cameron", "Nelson", 1, 2), ("Charlie", "Kelly", 2,  null), ("George", "Costanza", 3, 4), ("Jerry", "Seinfeld", 4, null), ("James", "Beast", 5, null), ("John", "Cena", 6, null), ("Paul", "Rudd", 7, 2), ("Jack", "Ripper", 8, null);