const RegisteredComment = require('../../Domains/comments/entities/RegisteredComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const { mapCommentsToModel } = require('./utils');
const ReplyRepositoryPostgres = require('./ReplyRepositoryPostgres');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._reply = new ReplyRepositoryPostgres(pool,idGenerator);
  }

  async addComment(registerComment) {
    const { content, threadId, owner } = registerComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, threadId, owner, date],
    };

    const result = await this._pool.query(query);

    return new RegisteredComment({ ...result.rows[0] });
  }

  async getComments(threadId){
    const queryComment = {
      text: `select 
                comments.id,
                username,
                date,
                content
              from comments
              LEFT JOIN users ON comments.owner = users.id
              where "threadId" = $1`,
      values: [threadId],
    };
    const resultComment = await this._pool.query(queryComment);
    
    const tempComment = resultComment.rows.map(mapCommentsToModel);
    for(let i=0;i<tempComment.length;i++){
      tempComment[i].replies = await this._reply.getReplies(tempComment[i].id);
    }

    return tempComment;
  }

  async verifyAvailableComment(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    
    if (!result.rowCount) {
      throw new NotFoundError('comment tidak tersedia');
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

  async deleteComment(id) {
    const is_delete = new Date().toISOString();
    const query = {
      text: `update comments
              set 
                content = '**komentar telah dihapus**',
                is_delete = $2
              WHERE id = $1`,
      values: [id, is_delete],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
