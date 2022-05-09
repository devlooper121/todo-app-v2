//jshint esversion:6
const pass = "4TVioZ72UJk6gr20";
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const res = require("express/lib/response");

// connect to database(Local);
mongoose.connect("mongodb+srv://admin-Dheeraj:4TVioZ72UJk6gr20@cluster0.bhqa0.mongodb.net/todolistDB");

// make new itemsSchema
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name field is required."]
  }
});

// make mongoose model from schema
const Item = mongoose.model("Item", itemsSchema);

// make 3 default item from mongoose model
const item1 = new Item({
  name: "Welcome to your todolist!"
})
const item2 = new Item({
  name: "Hit + icon to add new item"
})

const item3 = new Item({
  name: "<-- Hit this to delete an item."
})
// put them into default items
const defaultItems = [item1, item2, item3];

// make listSchema
const listSchema = {
  name : {
    type: String,
    required : [true, "this name field cannot be empty"]
  },
  items: [itemsSchema]
}

const List = new mongoose.model("List", listSchema);

// read the database


async function rootData(){
  let result = [];
  let listNames = await List.find({},{_id:0, name:1}).exec();
  let todolists = await Item.find({}).exec();
  result.push(listNames);
  result.push(todolists);
  return result;
}

async function customRoutData(title){
  let result = [];
  let listNames = await List.find({},{_id:0, name:1}).exec();
  let titleData = await List.findOne({name:title}).exec();
  result.push(listNames);
  result.push(titleData);
  return result;
}

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", async function(req, res) {

  const day = date.getDate();
  let foundData = await rootData();
  // console.log(foundData);
  if(foundData[1].length === 0){
    // use insert many to add all this item to todolistDB

    Item.insertMany(defaultItems, (err)=>{
      if(err){
        console.log(err);
      }else{
        console.log("inserted successfully") 
      }
    });
    res.redirect("/");
  }else 
    res.render("list", {listTitle: day, newListItems: foundData[1], allTitle: foundData[0]});
  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem.trim();
  const listTitle = req.body.listTitle;
  if(itemName != ""){
    const item = new Item({
      name : itemName
    });

    if(listTitle === date.getDate()){
      item.save(); 
      res.redirect("/");
    }else{
      List.findOne({name:listTitle}, (err, foundItems)=>{
        if(!err){
          foundItems.items.push(item);
          foundItems.save();
          res.redirect("/"+listTitle);
        }
      })
    }
  }else{
    if(listTitle === date.getDate()){
      res.redirect("/");
    }else{
      res.redirect("/"+listTitle);
    }
  }
  
  
});

// make delete route

app.post("/delete", (req, res) => {
  const id = req.body.checkbox;
  const listName = req.body.listTitle;
  // console.log(req.body)
  if(listName === date.getDate()){
    Item.deleteOne({_id:id}, err => {
      if(err) {
        console.log(err);
      }else{
        // alert("deleted successFully");
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull : {items:{_id:id}}}, (err, foundList)=>{
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
  
})
// making a variable route which can be made by accessing the root route/ name
// for this to save in backend , make a listSchema that has nameOfPage and second listOfNotes
/**
 * {
 *    name: String,
 *    list: itemsSchema // so we can store all list in particular field
 * }
 */

app.get("/:customListName", async function(req,res){

  const nameOfList = _.capitalize(req.params.customListName.trim());
  // first find if the given name exists in our databse
  let foundData = await customRoutData(nameOfList);
  if(foundData[1]== null){
    const defaultList = new List({
      name: nameOfList,
      items: defaultItems
    })
    // console.log("yyy")
    // making sure user not put the spaces only
    if(nameOfList != ""){
      defaultList.save();
      res.redirect("/"+nameOfList);
    }else{
      res.redirect("/");
    }
  }else{
    res.render("list", {listTitle: foundData[1].name, newListItems: foundData[1].items, allTitle: foundData[0]})
  }
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT ||3000, function() {
  console.log("Server started on port 3000");
});
