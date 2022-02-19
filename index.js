const inquirer = require('inquirer');
const consTable = require('console.table')

const promtUser = () => {
    inquirer.prompt([
        {
            name: 'options',    
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
    ])
    .then((Selected) => {
        const {choices} = answers;

        if(choices === 'View All Employees') {
            viewAllEmployees()
        }
    })
}