const RegisterThread = require('../RegisterThread');

describe('a RegisterThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'abc',
    };
    const owner = 'user-123';
    // Action and Assert
    expect(() => new RegisterThread(payload,{owner})).toThrowError('REGISTER_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 123,
      body: 'abc',
    };
    const owner = {};

    // Action and Assert
    expect(() => new RegisterThread(payload,{owner})).toThrowError('REGISTER_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create registerThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'dicoding',
      body: 'abc',
    };
    const tempOwner = 'user-123';

    // Action
    const { title, body, owner } = new RegisterThread(payload,{owner: tempOwner});

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(owner);
  });
});
