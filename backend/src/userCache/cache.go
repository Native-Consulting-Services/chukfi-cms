package userCache

// super simple in-memory cache with expiration and max size limit

import (
	"sync"
	"time"
	"github.com/Native-Consulting-Services/chukfi-cms/src/database"
)

type UserCacheItem struct {
	Value database.User
	Token string
	// Expiration time
	ExpiresAt time.Time
}

type UserCache struct {
	items   map[string]UserCacheItem
	mu      sync.RWMutex
	maxSize int
}

func NewUserCache(maxSize int) *UserCache {
	return &UserCache{
		items:   make(map[string]UserCacheItem),
		maxSize: maxSize,
	}
}

func (c *UserCache) Get(token string) (database.User, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, ok := c.items[token]
	if !ok || item.ExpiresAt.Before(time.Now()) {
		return database.User{}, false
	}

	return item.Value, true
}

func (c *UserCache) Set(token string, user database.User) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if len(c.items) >= c.maxSize {
		// delete all items that are expired + 1
		for k, v := range c.items {
			if v.ExpiresAt.Before(time.Now()) {
				delete(c.items, k)
			}
		}
		// if still full, delete random item
		if len(c.items) >= c.maxSize {
			for k := range c.items {
				delete(c.items, k)
				break
			}
		}
	}

	c.items[token] = UserCacheItem{
		Value:     user,
		Token:     token,
		ExpiresAt: time.Now().Add(time.Minute * 30),
	}
}

func (c *UserCache) Delete(token string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.items, token)
}

func (c *UserCache) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items = make(map[string]UserCacheItem)
}

func (c *UserCache) Cleanup() {
	c.mu.Lock()
	defer c.mu.Unlock()
	now := time.Now()
	for k, v := range c.items {
		if v.ExpiresAt.Before(now) {
			delete(c.items, k)
		}
	}
}

var UserCacheInstance = NewUserCache(100)
var CacheCleanupInterval = time.Minute * 10

func StartCacheCleanupRoutine() {
	ticker := time.NewTicker(CacheCleanupInterval)
	go func() {
		for range ticker.C {
			UserCacheInstance.Cleanup()
		}
	}()
}
