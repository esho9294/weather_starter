# Troubleshooting

## Common Issues

### Port Already in Use

**Symptoms:** Server fails to start with port conflict error

**Solution:**
- Portless uses random local port, proxied via port 1355
- Check for other Portless instances: `ps aux | grep portless` (Unix) or `tasklist | findstr portless` (Windows)
- Kill existing Portless processes
- Restart with `npm run dev`

### Database Locked

**Symptoms:** SQLite database lock errors during operations

**Solution:**
- SQLite WAL mode should prevent most locks
- Close any database viewers or tools accessing `backend/weather.db`
- Reset database: `npm run reset`
- Restart the server

### Weather API Rate Limits

**Symptoms:** 429 Too Many Requests errors, missing weather data

**Solution:**
- Add `WEATHER_API_KEY` to `.env` file
- Reduce refresh frequency during development
- Implement caching for repeated requests
- Use mock data for testing

### Tests Failing

**Symptoms:** Test suite fails unexpectedly

**Solution:**
- Ensure `NODE_ENV=test` is set (automatic in vitest.config.ts)
- Check test database isolation
- Run `npm run reset` to clear database
- Verify no other processes are using test ports
- Check for external API mocking

### Build Errors

**Symptoms:** Build fails with TypeScript or Vite errors

**Solution:**
- Clear build artifacts: `rm -rf frontend/dist backend/dist` (Unix) or `rmdir /s /q frontend\dist backend\dist` (Windows)
- Clear node_modules: `rm -rf node_modules` (Unix) or `rmdir /s /q node_modules` (Windows)
- Reinstall dependencies: `npm install`
- Check TypeScript errors: `npx tsc --noEmit`

### Vite HMR Not Working

**Symptoms:** Hot module replacement not updating in browser

**Solution:**
- Check browser console for WebSocket errors
- Restart dev server: `npm run dev`
- Clear browser cache
- Check firewall settings for WebSocket connections

### Missing Environment Variables

**Symptoms:** Application behavior differs from expected

**Solution:**
- Copy `.env.example` to `.env`
- Set required variables (most are optional)
- Restart server after changing environment variables
- Check `process.env` values in code

### Drizzle Migration Errors

**Symptoms:** Database schema out of sync, migration failures

**Solution:**
- Generate new migration: `npm run db:generate`
- Apply migrations: `npm run db:migrate`
- If migrations are corrupted, reset database: `npm run reset`
- Regenerate migrations from schema

### Portless Not Working

**Symptoms:** Cannot access `http://weather-starter.localhost:1355`

**Solution:**
- Check Portless is installed: `npm list portless`
- Verify port 1355 is not blocked by firewall
- Try accessing via `http://127.0.0.1:PORT` (check console for actual port)
- Reinstall Portless: `npm install portless`

## Debugging Tips

### Backend Debugging

- Check logs in `backend/logs/app.log`
- Set `LOG_LEVEL=debug` for verbose logging
- Use `npm run doctor` to verify API health
- Test endpoints with curl or Postman

### Frontend Debugging

- Open browser DevTools console
- Check Network tab for API request/response
- Use React DevTools for component inspection
- Check `logInteraction()` calls in Network tab

### Database Debugging

- Inspect database: `sqlite3 backend/weather.db`
- View tables: `.tables`
- Query data: `SELECT * FROM locations;`
- Check schema: `.schema locations`

## Getting Help

If issues persist:

1. Check README.md for setup instructions
2. Review relevant documentation in `docs/`
3. Check GitHub issues (if applicable)
4. Verify all dependencies are installed: `npm install`
5. Try a clean install: remove `node_modules` and reinstall
