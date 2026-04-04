import { describe, it, expect, vi } from 'vitest';
import { Client, Invite } from '../';
import { Routes } from '@erinjs/types';

function createMockClient() {
  return {} as Client;
}

function createMockClientWithInviteResponse(response: {
  code?: string;
  type?: number;
  guild?: { id: string; name: string };
  channel?: { id: string; name: string; type: number };
}) {
  const get = vi.fn().mockResolvedValue({
    code: response.code ?? 'abc123',
    type: response.type ?? 0,
    guild: response.guild ?? { id: 'g1', name: 'Test' },
    channel: response.channel ?? { id: 'ch1', name: 'general', type: 0 },
  });

  return {
    client: {
      rest: { get },
      guilds: new Map(),
    } as unknown as Client,
    get,
  };
}

function createInvite(overrides: { code?: string } = {}) {
  return new Invite(createMockClient(), {
    code: overrides.code ?? 'abc123',
    type: 0,
    guild: { id: 'g1', name: 'Test' },
    channel: { id: 'ch1', name: 'general', type: 0 },
  });
}

describe('Invite', () => {
  describe('url', () => {
    it('returns full invite URL with code', () => {
      const invite = createInvite({ code: 'xyz789' });
      expect(invite.url).toBe('https://fluxer.gg/xyz789');
    });

    it('uses invite code from constructor', () => {
      const invite = createInvite({ code: 'discord' });
      expect(invite.url).toBe('https://fluxer.gg/discord');
    });
  });

  describe('constructor', () => {
    it('parses invite code and channel', () => {
      const invite = createInvite({ code: 'testcode' });
      expect(invite.code).toBe('testcode');
      expect(invite.channel.name).toBe('general');
    });
  });

  describe('fetch()', () => {
    it('fetches invite by raw code', async () => {
      const { client, get } = createMockClientWithInviteResponse({ code: 'abc123' });

      const invite = await Invite.fetch(client, 'abc123');

      expect(get).toHaveBeenCalledWith(Routes.invite('abc123'));
      expect(invite.code).toBe('abc123');
    });

    it('fetches invite by full URL', async () => {
      const { client, get } = createMockClientWithInviteResponse({ code: 'xyz789' });

      const invite = await Invite.fetch(client, 'https://fluxer.gg/xyz789');

      expect(get).toHaveBeenCalledWith(Routes.invite('xyz789'));
      expect(invite.code).toBe('xyz789');
    });

    it('fetches invite by /invite/{code} URL', async () => {
      const { client, get } = createMockClientWithInviteResponse({ code: 'code123' });

      const invite = await Invite.fetch(client, 'https://web.fluxer.app/invite/code123');

      expect(get).toHaveBeenCalledWith(Routes.invite('code123'));
      expect(invite.code).toBe('code123');
    });

    it('throws for empty input', async () => {
      const { client } = createMockClientWithInviteResponse({});

      await expect(Invite.fetch(client, '   ')).rejects.toThrow('Invite code cannot be empty');
    });

    it('throws for URL without code', async () => {
      const { client } = createMockClientWithInviteResponse({});

      await expect(Invite.fetch(client, 'https://fluxer.gg/')).rejects.toThrow(
        'Invalid invite code or URL',
      );
    });
  });
});
