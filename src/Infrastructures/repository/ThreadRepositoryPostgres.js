const RegisteredThread = require('../../Domains/threads/entities/RegisteredThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const { mapThreadToModel,mapCommentsToModel } = require('./utils');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(registerThread) {
    const { title, body, owner } = registerThread;
    const date = new Date().toISOString();
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, owner, date],
    };

    const result = await this._pool.query(query);

    return new RegisteredThread({ ...result.rows[0] });
  }

  async checkAvailabilityThread(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('threadId tidak ditemukan di database');
    }
  }

  async verifyAvailableThread(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    
    if (!result.rowCount) {
      throw new NotFoundError('thread tidak tersedia');
    }
  }
  
  async getThreadById(id) {
    const queryThread = {
        text: `select 
                  threads.id,
                  title,
                  body,
                  date,
                  username
                from threads
                LEFT JOIN users ON threads.owner = users.id
                where threads.id = $1`,
        values: [id],
    };
    const resultThread = await this._pool.query(queryThread);
    if (!resultThread.rows.length) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    const queryComment = {
      text: `select 
                comments.id,
                username,
                date,
                content
              from comments
              LEFT JOIN users ON comments.owner = users.id
              where "threadId" = $1`,
      values: [id],
    };
    const resultComment = await this._pool.query(queryComment);
    let thread = resultThread.rows.map(mapThreadToModel)[0];
    thread.comments = resultComment.rows.map(mapCommentsToModel);

    return thread;
  }
}

module.exports = ThreadRepositoryPostgres;
