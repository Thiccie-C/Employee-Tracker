const inquirer = require('inquirer');
const consTable = require('console.table');
const mysql = require('mysql2')
const validate = require('./validator/validate')

require('dotenv').config();

const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: process.env.password,
    database: 'employees'
});

connection.connect((err) => {
    if (err) throw err;
    console.log("==============================")
    console.log("===    Employee Tracker    ===")
    console.log("==============================")
    promtUser()
})
const promtUser = () => {
    inquirer.prompt([
        {
            name: 'choices',    
            type: 'list',
            message: 'Please select an option',
            choices: [
                'View All Employees',
                'View All Roles',
                'View All Departments',
                'View All Employees By Department',
                'View Department Budgets',
                'Update Employee Role',
                'Update Employee Manager',
                'Add Employee',
                'Add Role',
                'Add Department',
                'Remove Employee',
                'Remove Role',
                'Remove Department',
                'Exit'
            ]
        }
    ]).then((Selected) => {
        const {choices} = Selected;

        if (choices === 'View All Employees') {
            viewAllEmployees();
        }

        if(choices === 'View All Roles') {
            viewAllRoles()
        }

        if (choices === 'View All Departments') {
          viewAllDepartments();
      }

        if (choices === 'View All Employees By Department') {
            viewEmployeesByDepartment();
        }

        if (choices === 'View Department Budgets') {
            viewDepartmentBudget();
        }

        if (choices === 'Update Employee Role') {
            updateEmployeeRole()
        }

        if(choices === 'Update Employee Manager') {
            updateEmployeeManager()
        }

        if (choices === 'Add Employee') {
            addEmployee();
        }

        if(choices === 'Add Role') {
            addRole();
        }
        
        if(choices === 'Add Department') {
            addDepartment()
        }

        if(choices === 'Remove Employee') {
            removeEmployee()
        }

        if(choices === 'Remove Role') {
            removeRole()
        }

        if(choices === 'Remove Department') {
            removeDepartment()
        }

        if(choices === 'Exit') {
            connection.end();
        }
    })
}

// View All Employees
const viewAllEmployees = () => {
    let sql =     `SELECT employee.id, 
                  employee.first_name, 
                  employee.last_name, 
                  role.title, 
                  department.department_name AS 'department', 
                  role.salary
                  FROM employee, role, department 
                  WHERE department.id = role.department_id 
                  AND role.id = employee.role_id
                  ORDER BY employee.id ASC`;
    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res)
        promtUser();
    });
};
// View all Departments
const viewAllRoles = () => {
    const sql = `SELECT role.id, role.title, department.department_name AS department
                FROM role
                INNER JOIN department ON role.department_id = department.id`;
    connection.query(sql, (err, res) => {
        if (err) throw err;
        res.forEach((role) => {console.log(role.title);});
        promtUser();
    })
};
// View all Departments
const viewAllDepartments = () => {
    const sql = `SELECT department.id AS id, department.department_name AS department FROM department`; 
    connection.query(sql, (err, res) => {
        if(err) throw err;
        console.table(res);
        promtUser();
    });
};

// View all Employees By Department
const viewEmployeesByDepartment = () => {
    const sql =   `SELECT employee.first_name, 
                  employee.last_name, 
                  department.department_name AS department
                  FROM employee 
                  LEFT JOIN role ON employee.role_id = role.id 
                  LEFT JOIN department ON role.department_id = department.id`;
    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res)
        promtUser();
    });
};

// View Departments by Budget
viewDepartmentBudget = () => {
    const sql = `SELECT department_id AS id, 
                  department.department_name AS department,
                  SUM(salary) AS budget
                  FROM  role  
                  INNER JOIN department ON role.department_id = department.id GROUP BY  role.department_id`;
    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        promtUser();
    })
}

//Add new Employee
const addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: "What is the employee's first name?",
            validate: addFN => {
                if (addFN) {
                    return true;
                } else {
                    console.log('Please enter a first name');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: "What is the employee's last name?",
            validate: addLN => {
                if(addLN) {
                    return true;
                } else {
                    console.log('Please enter a last name');
                    return false;
                }
            }
        }
    ])
     .then(answer => {
         const fullName = [answer.firstName, answer.lastName]
         const roleSql = `SELECT role.id, role.title FROM role`;
         connection.query(roleSql, (err, data) => {
             if (err) throw err;
             const roles = data.map(({ id, title }) => ({ name: title, value: id }));
             inquirer.prompt([
                 {
                     type: 'list',
                     name: 'role',
                     message: "What is the employee's role?",
                     choices: roles
                 }
             ])
              .then(roleChoice => {
                  const role = roleChoice.role;
                  fullName.push(role);
                  const managerSql = `SELECT * FROM employee`;
                  connection.query(managerSql, (err, data) => {
                      if(err) throw err;
                      const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
                      inquirer.prompt([
                          {
                              type: 'list',
                              name: 'manager',
                              message: "Who is the employee's manager",
                              choices: managers
                          }
                      ])
                        .then(managerChoice => {
                            const manager = managerChoice.manager;
                            fullName.push(manager);
                            const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                        VALUES (?, ?, ?, ?)`;
                            connection.query(sql, fullName, (err) => {
                                if (err) throw err;
                                console.log("Employee has been added!")
                                viewAllEmployees();
                            });
                        });
                  });
              });
         });
     });
};

// Add a New Role
const addRole = () => {
    const sql = `SELECT * FROM department`
    connection.query(sql, (err, res) => {
        if(err) throw err;
        let depNamesArray = [];
        res.forEach((department) => {depNamesArray.push(department.department_name);})
        depNamesArray.push('Create Department');
        inquirer.prompt([
            {
                name: 'departmentName',
                type: 'list',
                message: 'which department is this new role in?',
                choices: depNamesArray
            }
        ])
        .then((res) => {
            if(res.departmentName === 'Create Department') {
                this.addDepartment();
            } else {
                addRoleResume(res)
            }
        });

        const addRoleResume = (departmentData) => {
            inquirer.prompt([
                {
                    name: 'newRole',
                    type: 'input',
                    message: 'What is the name of your new role?',
                    validate: validate.validateString
                },
                {
                    name: 'salary',
                    type: 'input',
                    message: 'What is the salary of this new role?',
                    validate: validate.validateSalary
                }
            ])
            .then((role) => {
                let createdRole = role.newRole;
                let departmentId;
                
                res.forEach((department) => {
                    if(departmentData.departmentName === department.department_name) {departmentId = department.id;}
                })

                let sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                let roleData = [createdRole, role.salary, departmentId];

                connection.query(sql, roleData, (err) => {
                    if(err) throw err;
                    viewAllRoles()
                })
            })
        }
    });
}

// Add a New Department
const addDepartment = () => {
    inquirer
        .prompt([
            {
                name: 'newDepartment',
                type: 'input',
                message: 'What is the name of your new Department?',
                validate: validate.validateString
            }
        ])
        .then((Department) => {
            let sql =   `INSERT INTO department (department_name) VALUES (?)`;
            connection.query(sql, Department.newDepartment, (err, res) => {
                if (err) throw err;
                viewAllDepartments();
            })
        })
}

// Update an Employee's Role
const updateEmployeeRole = () => {
    let sql =   `SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
                    FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id`;
    connection.query(sql, (err, res) => {
        if (err) throw err;
        let employeeNamesArray = [];
        res.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

        let sql =     `SELECT role.id, role.title FROM role`;
        connection.query(sql, (err, res) => {
            if(err) throw err;
            let rolesArray = [];
            res.forEach((role) => {rolesArray.push(role.title);});

            inquirer.prompt([
                {
                    name: 'pickedEmployee',
                    type: 'list',
                    message: 'Which employee has a new role?',
                    choices: employeeNamesArray
                },
                {
                    name: 'chosenRole',
                    type: 'list',
                    message: 'What is their new role?',
                    choices: rolesArray
                }
            ])
            .then((answer) => {
                let newTitleId, employeeId;

                res.forEach((role) => {
                    if(answer.chosenRole === role.title) {
                        newTitleId = role.id;
                    }
                })

                res.forEach((employee) => {
                    if (
                        answer.pickedEmployee ===
                        `${employee.first_name} ${employee.last_name}`
                    ) {
                        employeeId = employee.id;
                    }
                });

                let sqls = `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
                connection.query(sqls, [newTitleId, employeeId],
                    (err) => {
                        if (err) throw err;
                        promtUser();
                    }
                );
            });
        });
    });
};

// Update an Employee's Manager
const updateEmployeeManager = () => {
    let sql =   `SELECT employee.id, employee.first_name, employee.last_name, employee.manager_id
                FROM employee`;
    connection.query(sql, (err, res) => {
        let employeeNamesArray = [];
        res.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);})

        inquirer
            .prompt([
                {
                    name: 'pickedEmployee',
                    type: 'list',
                    message: 'Which employee has a new manager?',
                    choices: employeeNamesArray
                },
                {
                    name: 'newManager',
                    type: 'list',
                    message: 'Who is their manager',
                    choices: employeeNamesArray
                }
            ])
            .then((answer) => {
                let employeeId, managerId;
                res.forEach((employee) => {
                    if (
                        answer.chosenEmployee === `${employee.first_name} ${employee.last_name}`
                      ) {
                        employeeId = employee.id;
                      }
          
                      if (
                        answer.newManager === `${employee.first_name} ${employee.last_name}`
                      ) {
                        managerId = employee.id;
                      }
                });

                if(validate.isSame(answer.pickedEmployee, answer.newManager)) {
                    promtUser()
                } else {
                    let sql = `UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?`;
                    connection.query(sql, [managerId, employeeId], (err) => {
                        if (err) throw err;
                        promtUser()
                    })
                }
            })
    })
}

// Delete an Employee
const removeEmployee = () => {
    let sql =     `SELECT employee.id, employee.first_name, employee.last_name FROM employee`;

    connection.query(sql, (err, res) => {
        if(err) throw err;
        let employeeNamesArray = [];
        res.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

        inquirer
            .prompt([
                {
                    name: 'pickedEmployee',
                    type: 'list',
                    message: 'Which employee would you like to remove?',
                    choices: employeeNamesArray
                }
            ])
            .then((answer) => {
                let employeeId;

                res.forEach((employee)=> {
                    if(
                        answer.pickedEmployee === `${employee.first_name} ${employee.last_name}`
                    ) {
                        employeeId = employee.id;
                    }
                });
                let sql = `DELETE FROM employee WHERE employee.id = ?`;
                connection.query(sql, [employeeId], (err) => {
                    if(err) throw err;
                    viewAllEmployees()
                })
            })
    })
}

// Delete a Role
const removeRole = () => {
    let sql = `SELECT role.id, role.title FROM role`;

    connection.query(sql, (err, res) => {
        if (err) throw err;
        let roleNamesArray = [];
        res.forEach((role) => {roleNamesArray.push(role.title)});

        inquirer
            .prompt([
                {
                    name: 'pickedRole',
                    type: 'list',
                    message: 'Which role would you like to remove?',
                    choices: roleNamesArray
                }
            ])
            .then((answer) => {
                let roleId;

                res.forEach((role) => {
                    if(answer.pickedRole === role.title) {
                        roleId = role.id;
                    }
                });

                let sql = `DELETE FROM role WHERE role.id = ?`;
                connection.query(sql, [roleId], (err) => {
                    if(err) throw err;
                    viewAllRoles()
                });
            });
    });
};

// Delete a Department
const removeDepartment = () => {
    let sql = `SELECT department.id, department.department_name FROM department`;
    connection.query(sql, (err, res) => {
        if (err) throw err;
        let departmentNamesArray = [];
        res.forEach((department) => {departmentNamesArray.push(department.department_name);});

        inquirer.prompt([
            {
                name: 'pickedDept',
                type: 'list',
                message: 'Which department would you like to remove?',
                choices: departmentNamesArray
            }
        ])
        .then((answer) => {
            let departmentId;

            res.forEach((department) => {
                if (answer.chosenDept === department.department_name) {
                    departmentId = department.id;
                  }
            });

            let sql = `DELETE FROM department WHERE department.id = ?`;
            connection.query(sql, [departmentId], (err) => {
                if (err) throw err;
                viewAllDepartments()
            })
        })
    })
}