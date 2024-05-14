const express = require('express')
const router = express.Router();
const Owner = require('../models/owner')
const Pool = require('../models/pool')

// All Owners Route
router.get('/', ensureAuthenticated, async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const owners = await Owner.find(searchOptions)
    res.render('owners/index', {
      owners: owners,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Owner Route
router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('owners/new', { owner: new Owner() })
})

// Create Owner Route
router.post('/', async (req, res) => {
  const owner = new Owner({
    name: req.body.name,
    email: req.body.email,
    number: req.body.number
  })
  try {
    const newOwner = await owner.save()
    console.log("Successfully created entry");
    res.redirect(`owners/${newOwner.id}`)
  } catch (error) {
    console.log(error);
    res.render('owners/new', {
      owner: owner,
      errorMessage: 'Error creating Owner'
    })
  }
})

router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id)
    const pools = await Pool.find({ owner: owner.id }).limit(6).exec()
    res.render('owners/show', {
      owner: owner,
      poolsByOwner: pools
    })
  } catch {
    res.redirect('/')
  }
})

router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id)
    res.render('owners/edit', { owner: owner })
  } catch {
    res.redirect('/owners')
  }
})

router.put('/:id', ensureAuthenticated, async (req, res) => {
  let owner
  try {
    owner = await Owner.findById(req.params.id)
    owner.name = req.body.name
    owner.email = req.body.email
    owner.number = req.body.number
    await owner.save()
    res.redirect(`/owners/${owner.id}`)
  } catch {
    if (owner == null) {
      res.redirect('/')
    } else {
      res.render('owners/edit', {
        owner: owner,
        errorMessage: 'Error updating Owner'
      })
    }
  }
})

router.delete('/:id', ensureAuthenticated, async (req, res) => {
  let owner
  try {
    owner = await Owner.findById(req.params.id)
    await owner.deleteOne()
    console.log("hi");
    res.redirect('/owners')
  } catch {
    if (owner == null) {
      res.redirect('/')
    } else {
      console.log("cant delete");
      res.redirect(`/owners/${owner.id}`)
    }
  }
})

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect('/login');
}

module.exports = router;