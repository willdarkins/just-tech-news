const bcrypt = require('bcrypt');
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

// create our User model
class User extends Model { }

// define table columns and configuration
//The .init() method we execute after is the part that actually provides context as to how those inherited methods should work.
User.init(
  {
    // define an id column
    id: {
      // use the special Sequelize DataTypes object provide what type of data it is
      type: DataTypes.INTEGER,
      // this is the equivalent of SQL's `NOT NULL` option
      allowNull: false,
      // instruct that this is the Primary Key
      primaryKey: true,
      // turn on auto increment
      autoIncrement: true
    },
    // define a username column
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // define an email column
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      // there cannot be any duplicate email values in this table
      unique: true,
      // if allowNull is set to false, we can run our data through validators before creating the table data
      validate: {
        isEmail: true
      }
    },
    // define a password column
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        // this means the password must be at least four characters long
        len: [4]
      }
    }
  },
  {
    hooks: {
      //We use the beforeCreate() hook to execute the bcrypt hash function on the plaintext password.
      //we pass in the userData object that contains the plaintext password in the password property
      // set up beforeCreate lifecycle "hook" functionality
      async beforeCreate(newUserData) {
        //We also pass in a saltRound value of 10.
        newUserData.password = await bcrypt.hash(newUserData.password, 10);
        return newUserData;
        /*The resulting hashed password is then passed to the Promise object as a newUserData object
        with a hashed password property. The return statement then exits out of the function, returning
        the hashed password in the newUserData function.*/
      },
      // set up beforeUpdate lifecycle "hook" functionality
  async beforeUpdate(updatedUserData) {
    updatedUserData.password = await bcrypt.hash(updatedUserData.password, 10);
    return updatedUserData;
  }
    },
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'user'
  }
);
module.exports = User;
