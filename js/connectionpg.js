const { Pool } = require('pg');

const pool = new Pool({
  user: 'azthrtech_quest',
  host: '162.241.218.130',
  database: 'azthrtec_pgdb1',
  password: 'rhgwyyyvgjubyviqdfgkzmbreqomidtuwlumrueezehljsuuswjvnzgqpvourryfb',
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }

  console.log('Connected to remote PostgreSQL database!');

  client.query('SELECT NOW()', (err, result) => {
    release();

    if (err) {
      return console.error('Error executing query', err.stack);
    }

    console.log('Result:', result.rows[0]);

    pool.end(() => {
      console.log('Disconnected from remote PostgreSQL database!');
    });
  });
});