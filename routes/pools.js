const express = require('express')
const router = express.Router();
const Pool = require('../models/pool')
const Owner = require('../models/owner')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

// All Pools Route
router.get('/', ensureAuthenticated, async (req, res) => {
  let query = Pool.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  // if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
  //   query = query.lte('publishDate', req.query.publishedBefore)
  // }
  // if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
  //   query = query.gte('publishDate', req.query.publishedAfter)
  // }
  try {
    const pools = await query.exec()
    res.render('pools/index', {
      pools: pools,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

router.get('/new', ensureAuthenticated, (req, res) => {
  renderNewPage(res, new Pool())
})

// Create Pool Route
router.post('/', async (req, res) => {
  const pool = new Pool({
    type: req.body.type,
    owner: req.body.owner,
    status: req.body.status,
    description: req.body.description
  })
  saveCover(pool, req.body.cover)

  try {
    const newPool = await pool.save()
    res.redirect(`pools/${newPool.id}`)
  } catch {
    renderNewPage(res, pool, true)
  }
})

// Show Book Route
router.get('/:id', async (req, res) => {
  try {
    const pool = await Pool.findById(req.params.id)
      .populate('owner')
      .exec()
    res.render('pools/show', { pool: pool })
  } catch {
    res.redirect('/')
  }
})

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

async function renderNewPage(res, pool, hasError = false) {
  renderFormPage(res, pool, 'new', hasError)
}

async function renderEditPage(res, pool, hasError = false) {
  renderFormPage(res, pool, 'edit', hasError)
}

async function renderFormPage(res, pool, form, hasError = false) {
  try {
    const owners = await Owner.find({})
    const params = {
      owners: owners,
      pool: pool
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Pool'
      } else {
        params.errorMessage = 'Error Creating Pool'
      }
    }
    res.render(`pools/${form}`, params)
  } catch {
    res.redirect('/pools')
  }
}

function saveCover(pool, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    pool.coverImage = new Buffer.from(cover.data, 'base64')
    pool.coverImageType = cover.type
  }
}

module.exports = router;