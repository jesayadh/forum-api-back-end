const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const RegisterReply = require('../../../Domains/replies/entities/RegisterReply');
const RegisteredReply = require('../../../Domains/replies/entities/RegisteredReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist register reply and return registered reply correctly', async () => {
      // Arrange
      const registerReply = new RegisterReply({
        content: 'dicoding',
        threadId:'thread-123',
        commentId:'comment-123',
        owner:'user-123'
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(registerReply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should return registered reply correctly', async () => {
      // Arrange
      const registerReply = new RegisterReply({
        content: 'dicoding',
        threadId:'thread-123',
        commentId:'comment-123',
        owner:'user-123'
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const registeredReply = await replyRepositoryPostgres.addReply(registerReply);

      // Assert
      expect(registeredReply).toStrictEqual(new RegisteredReply({
        id: 'reply-123',
        content: 'dicoding',
        owner: 'user-123',
      }));
    });

    describe('verifyAvailableReply function', () => {
      it('should throw NotFoundError if reply not available', async () => {
        // Arrange
        const replyRepository = new ReplyRepositoryPostgres(pool);
        const reply = 'reply';
  
        // Action & Assert
        await expect(replyRepository.verifyAvailableReply(reply))
          .rejects.toThrow(NotFoundError);
      });
  
      it('should not throw NotFoundError if reply available', async () => {
        // Arrange
        const replyRepository = new ReplyRepositoryPostgres(pool);
        const content = 'content';
        await RepliesTableTestHelper.addReply(content);
  
        // Action & Assert
        await expect(replyRepository.verifyAvailableReply("reply-123"))
          .resolves.not.toThrow(NotFoundError);
      });
    });

    describe('verifyReplyOwner function', () => {
      it('should throw AuthorizationError if reply not available', async () => {
        // Arrange
        const replyRepository = new ReplyRepositoryPostgres(pool);
        const reply = 'reply-123';
        await RepliesTableTestHelper.addReply({owner:'user-123'});
  
        // Action & Assert
        await expect(replyRepository.verifyReplyOwner(reply,"user-234"))
          .rejects.toThrow(AuthorizationError);
      });
  
      it('should not throw AuthorizationError if reply available', async () => {
        // Arrange
        const replyRepository = new ReplyRepositoryPostgres(pool);
        const content = 'content';
        await RepliesTableTestHelper.addReply(content);
  
        // Action & Assert
        await expect(replyRepository.verifyReplyOwner("reply-123","user-123"))
          .resolves.not.toThrow(AuthorizationError);
      });
    });

    describe('getReplies', () => {
      it('should get reply from database', async () => {
        const replyRepository = new ReplyRepositoryPostgres(pool);
        const comment = 'comment-123';
        await CommentsTableTestHelper.addComment({id:comment});
        await RepliesTableTestHelper.addReply(comment);
  
        const replies = await replyRepository.getReplies(comment);
  
        expect(replies).toHaveLength(1);
      });
    });

    describe('deleteReply', () => {
      it('should delete reply from database', async () => {
        // Arrange
        const replyRepository = new ReplyRepositoryPostgres(pool);
        const reply = 'reply';
        await RepliesTableTestHelper.addReply(reply);
  
        // Action
        await replyRepository.deleteReply(reply);
  
        // Assert
        const replies = await RepliesTableTestHelper.findRepliesById(reply);
        expect(replies).toHaveLength(0);
      });
    });
  });
});
