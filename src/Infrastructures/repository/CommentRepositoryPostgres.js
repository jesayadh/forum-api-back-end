const RegisteredComment = require('../../Domains/comments/entities/RegisteredComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

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
    
    if (!result.rowCount) {
      throw new NotFoundError('thread tidak tersedia');
    }
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 and is_delete IS NULL',
      values: [id],
    };
    const result = await this._pool.query(query);
    const Comment = result.rows[0];
    if (Comment.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async checkAvailabilityComment(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 and is_delete IS NULL',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('commentId tidak ditemukan di database');
    }
  }

  async deleteComment(id) {
    const is_delete = new Date().toISOString();
    const query = {
      text: `update comments
              set is_delete = $2
              WHERE id = $1`,
      values: [id, is_delete],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
