const express = require("express");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();
const port = process.env.PORT;
const app = express();

app.use(express.json());
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// create user
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  const { data, error } = await supabase
    .from("users")
    .insert([{ name, email }]);

  if (error) return res.status(400).json(error);
  res.json(data);
});
// get users
app.get("/users", async (req, res) => {
  let {
    page = 1,
    limit = 20,
    sortBy = "created_at",
    orderBy = "asc",
    fields = ["*"],
  } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("users")
    .select(`${fields.join(",")}`, { count: "exact" }) // total count
    .order(sortBy, { ascending: orderBy === "asc" })
    .range(from, to);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({
    count,
    data,
  });
});

// register user
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return res.status(400).json(error);
  res.status(201).json(data);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json(error);
//   res.status(201).json(data);
    res.json({
        data: data.user,
        token: data.token,
    })
});


app.listen(port, () => {
  console.log(`server is connected on: ${port}`);
});
