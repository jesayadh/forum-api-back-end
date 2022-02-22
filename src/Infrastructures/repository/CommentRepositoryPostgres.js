const RegisteredComment = require('../../Domains/comments/entities/RegisteredComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(registerComment) {
    const { content, threadId, owner } = registerComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, threadId, owner],
    };

    const result = await this._pool.query(query);

    return new RegisteredComment({ ...result.rows[0] });
  }

  async verifyAvailableThread(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    console.log(result.rowCount);
    if (!result.rowCount) {
      throw new NotFoundError('thread tidak tersedia');
    }
  }
}

module.exports = CommentRepositoryPostgres;
