import { describe, it, expect, vi } from 'vitest';
import { Guild, Client } from '../';
import { Routes } from '@erinjs/types';

function createMockClient() {
  return {} as Client;
}

function createRestBackedGuild(restGetResponse: unknown) {
  const get = vi.fn().mockResolvedValue(restGetResponse);
  const client = {
    rest: { get },
    getOrCreateUser: (data: { id: string; username?: string; discriminator?: string }) => ({
      id: data.id,
      username: data.username ?? 'user',
      discriminator: data.discriminator ?? '0',
    }),
    guilds: new Map(),
    channels: new Map(),
  } as unknown as Client;

  const guild = new Guild(client, {
    id: 'guild1',
    name: 'Test Guild',
    icon: null,
    banner: null,
    splash: null,
    owner_id: 'owner1',
    features: [],
    afk_timeout: 0,
    nsfw_level: 0,
    verification_level: 0,
    mfa_level: 0,
    explicit_content_filter: 0,
    default_message_notifications: 0,
  });

  return { guild, get };
}

function createGuild(
  overrides: {
    id?: string;
    icon?: string | null;
    banner?: string | null;
    splash?: string | null;
  } = {},
) {
  return new Guild(createMockClient(), {
    id: overrides.id ?? 'guild1',
    name: 'Test Guild',
    icon: overrides.icon ?? null,
    banner: overrides.banner ?? null,
    splash: overrides.splash ?? null,
    owner_id: 'owner1',
    features: [],
    afk_timeout: 0,
    nsfw_level: 0,
    verification_level: 0,
    mfa_level: 0,
    explicit_content_filter: 0,
    default_message_notifications: 0,
  });
}

describe('Guild', () => {
  describe('iconURL()', () => {
    it('returns null when icon is null', () => {
      const guild = createGuild({ icon: null });
      expect(guild.iconURL()).toBeNull();
    });

    it('builds icon URL when icon is set', () => {
      const guild = createGuild({ icon: 'iconhash123' });
      const url = guild.iconURL();
      expect(url).toContain('fluxerusercontent.com/icons/guild1/iconhash123.png');
    });

    it('appends size when provided', () => {
      const guild = createGuild({ icon: 'hash' });
      const url = guild.iconURL({ size: 512 });
      expect(url).toContain('?size=512');
    });
  });

  describe('bannerURL()', () => {
    it('returns null when banner is null', () => {
      const guild = createGuild({ banner: null });
      expect(guild.bannerURL()).toBeNull();
    });

    it('builds banner URL when banner is set', () => {
      const guild = createGuild({ banner: 'bannerhash' });
      const url = guild.bannerURL();
      expect(url).toContain('fluxerusercontent.com/banners/guild1/bannerhash.png');
    });
  });

  describe('splashURL()', () => {
    it('returns null when splash is null', () => {
      const guild = createGuild({ splash: null });
      expect(guild.splashURL()).toBeNull();
    });

    it('builds splash URL when splash is set', () => {
      const guild = createGuild({ splash: 'splashhash' });
      const url = guild.splashURL();
      expect(url).toContain('fluxerusercontent.com/splashes/guild1/splashhash.png');
    });
  });

  describe('constructor', () => {
    it('parses guild id and name', () => {
      const guild = createGuild({ id: 'custom123' });
      expect(guild.id).toBe('custom123');
      expect(guild.name).toBe('Test Guild');
    });
  });

  describe('invite helper methods', () => {
    it('fetchInvites() fetches and maps guild invites', async () => {
      const { guild, get } = createRestBackedGuild([
        {
          code: 'abc123',
          type: 0,
          guild: { id: 'guild1', name: 'Test Guild' },
          channel: { id: 'channel1', type: 0, name: 'general' },
        },
      ]);

      const invites = await guild.fetchInvites();

      expect(get).toHaveBeenCalledWith(Routes.guildInvites('guild1'));
      expect(invites).toHaveLength(1);
      expect(invites[0]?.code).toBe('abc123');
    });

    it('fetchInvite() supports code-or-url helper flow', async () => {
      const { guild, get } = createRestBackedGuild({
        code: 'xyz789',
        type: 0,
        guild: { id: 'guild1', name: 'Test Guild' },
        channel: { id: 'channel1', type: 0, name: 'general' },
      });

      const invite = await guild.fetchInvite('https://fluxer.gg/xyz789');

      expect(get).toHaveBeenCalledWith(Routes.invite('xyz789'));
      expect(invite.code).toBe('xyz789');
    });
  });

  describe('guild sticker helper methods', () => {
    it('fetchStickers() fetches and caches guild stickers', async () => {
      const { guild, get } = createRestBackedGuild([
        {
          id: 'sticker1',
          name: 'sample_sticker_a',
          description: 'Sample sticker A',
          tags: ['sample', 'a'],
          animated: false,
        },
      ]);

      const stickers = await guild.fetchStickers();

      expect(get).toHaveBeenCalledWith(Routes.guildStickers('guild1'));
      expect(stickers).toHaveLength(1);
      expect(stickers[0]?.id).toBe('sticker1');
      expect(guild.stickers.get('sticker1')?.name).toBe('sample_sticker_a');
    });

    it('fetchSticker() fetches and caches a single guild sticker', async () => {
      const { guild, get } = createRestBackedGuild({
        id: 'sticker42',
        name: 'sample_sticker_b',
        description: 'Sample sticker B',
        tags: ['sample', 'b'],
        animated: false,
      });

      const sticker = await guild.fetchSticker('sticker42');

      expect(get).toHaveBeenCalledWith(Routes.guildSticker('guild1', 'sticker42'));
      expect(sticker.id).toBe('sticker42');
      expect(guild.stickers.get('sticker42')?.name).toBe('sample_sticker_b');
    });
  });
});
